import fs from 'fs';
import RxJs from "rxjs";
import RxFetch from "rxjs/fetch";
import RxJsOps from "rxjs/operators";

const globalConfig = JSON.parse(fs.readFileSync(config.dataFile));

const config = {
	authToken: globalConfig.auroraAccount.authToken,
	serivceAgreementId: globalConfig.serivceAgreementId,
	customerId: globalConfig.customerId,
	baseUrl: "https://api.auroraenergy.com.au/api/usage/day",
	numDaysToRetrieve: 10,
	parallellRequests: 5,
	outputFile: 'output.json'
};

const baseUrl = `${config.baseUrl}?serviceAgreementID=${config.serivceAgreementId}&customerId=${config.customerId}&index=-`;

const dayIndexList = [];
for( let cI=1; cI < config.numDaysToRetrieve+1; dayIndexList.push(cI++) );

const dayList = [];

const get = dayIndex => {
	const url = baseUrl + dayIndex;

	console.log(`${dayIndex} ====>`);
	return RxFetch.fromFetch(url, {
		headers: {Authorization: `Bearer ${config.authToken}`}
	}).pipe(
		RxJsOps.tap( response => console.log(`  ====> ${dayIndex}`	)),
		RxJsOps.mergeMap( response => response.json() ),
		RxJsOps.map( data => dayList.push(data))
	);

};

RxJs.from(dayIndexList).pipe(
	RxJsOps.mergeMap( (dayIndex, parallellRequests) => get(dayIndex), config.parallellRequests),
).subscribe( {
	complete: () => {		
		fs.writeFileSync(config.outputFile, JSON.stringify(dayList, null, 2));
	}
});

dayList.sort( (a, b) => a.StartDate - b.StartDate);

console.log( `Complete.  Output saved to ${config.outputFile}.`)