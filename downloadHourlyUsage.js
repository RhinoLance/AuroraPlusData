import fs from 'fs';
import RxJs from "rxjs";
import RxFetch from "rxjs/fetch";
import RxJsOps from "rxjs/operators";

const config = {
	baseUrl: "https://api.auroraenergy.com.au/api/usage/day",
	parallellRequests: 5,
	outputFile: 'output.json'
};

const globalConfig = JSON.parse(fs.readFileSync('./config.json'));

const baseUrl = `${config.baseUrl}?serviceAgreementID=${globalConfig.download.serivceAgreementId}&customerId=${globalConfig.download.customerId}&index=-`;

const dayIndexList = [];
for( let cI=1; cI < globalConfig.download.numDaysToRetrieve+1; dayIndexList.push(cI++) );

const dayList = [];

const get = dayIndex => {
	const url = baseUrl + dayIndex;

	return RxFetch.fromFetch(url, {
		headers: {Authorization: `Bearer ${globalConfig.download.authToken}`}
	}).pipe(
		RxJsOps.mergeMap( response => response.json() ),
		RxJsOps.retry(2),
		RxJsOps.tap( data => console.log(` ==> ${dayList.length+1}`)),
		RxJsOps.map( data => dayList.push(data)),
		RxJsOps.catchError( err => {
			console.error(`${dayIndex}: ${JSON.stringify(err)}`);
			return RxJs.of(err);
		})
	);

};

RxJs.from(dayIndexList).pipe(
	RxJsOps.mergeMap( (dayIndex, parallellRequests) => get(dayIndex), config.parallellRequests),
).subscribe( {
	error: err => console.error(err),
	complete: () => {	
		
		const filteredList = dayList.filter(v=> v.StartDate !== undefined);
		filteredList.sort( (a, b) => b.StartDate.localeCompare(a.StartDate));

		fs.writeFileSync(config.outputFile, JSON.stringify(filteredList, null, 2));

		console.log( `Complete.  Output saved to ${config.outputFile}.`)

	}
});

