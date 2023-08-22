import fs from 'fs';

const config = {
	dataFile: './output.json',
	csvFile: './daySummary.csv',
	peakStartHours: [7, 8, 9, 16, 17, 18, 19, 20]
};

const main = () => {
	const data = JSON.parse(fs.readFileSync(config.dataFile));

	let hours = buildHoursList(data);
	
	const usage = dailyPeakOffPeakUsage(hours);
	
	toCSV(usage);
	
	console.log(`Complete.  Output saved to ${config.csvFile}`);
	
}

const dailyPeakOffPeakUsage = ( data ) => {

	const dailyUsage = new Map();

	data.map( hour => {

		const startTime = new Date(hour.StartTime);

		let dayData;

		const timeKey = `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDate()}`;
		
		if( !dailyUsage.has(timeKey) ){
			
			dayData = {
				date: startTime,
				peak: {
					T31: 0,
					T41: 0
				},
				offPeak: {
					T31: 0,
					T41: 0
				}
			};

			dailyUsage.set(timeKey, dayData);
		}
		else{
			dayData = dailyUsage.get(timeKey);
		}

		if( isPeak( startTime )){
			addUsage(hour.KilowattHourUsage, dayData.peak);
		}
		else {
			addUsage(hour.KilowattHourUsage, dayData.offPeak);
		}

	});

	return dailyUsage;

};

const addUsage = ( source, dest ) => {

	try {
		dest.T31 += source.T31;
		dest.T41 += source.T41;
	}
	catch(e){
		console.error(e);
	}
};

const isPeak = time => {

	return config.peakStartHours.includes(time.getHours());
};

const buildHoursList = data => {

	const hours = [];

	data
		.filter(v=> v.MeteredUsageRecords != null)
		.map( day => {
			hours.push( ...day.MeteredUsageRecords.filter( hour => hour.KilowattHourUsage != null));
		});

	return hours;
};

const toCSV = data => {

	const csv = [];

	data.forEach( (value, key) => {
		csv.push([
			value.date.toLocaleDateString(),
			value.peak.T31.toFixed(2), 
			value.offPeak.T31.toFixed(2), 
			value.peak.T41.toFixed(2), 
			value.offPeak.T41.toFixed(2),
			(value.peak.T31 + value.peak.T41).toFixed(2),
			(value.offPeak.T31 + value.offPeak.T41).toFixed(2),
			(value.peak.T31 + value.offPeak.T31).toFixed(2),
			(value.peak.T41 + value.offPeak.T41).toFixed(2)
		]);
	});

	let writeStream = fs.createWriteStream(config.csvFile);
	writeStream.write('Date,Peak T31,Off Peak T31,Peak T41,Off Peak T41,Peak Total, OffPeak Total,T31 Total,T41 Total\n');

	csv.map( v => {
		writeStream.write(v.join(','));
		writeStream.write('\n');
	});

	writeStream.close();
};

main();