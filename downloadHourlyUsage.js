import fs from 'fs';
import RxJs from "rxjs";
import RxFetch from "rxjs/fetch";
import RxJsOps from "rxjs/operators";


const config = {
	authToken: "YOUR_BEARER_TOKEN",
	serivceAgreement: "YOUR_SERVICE_AGREEMENT_ID",
	customerId: "YOUR_CUSTOMER_ID",
	baseUrl: "https://api.auroraenergy.com.au/api/usage/day",
	numDaysToRetrieve: 365,
	parallellRequests: 5,
	outputFile: 'output.json'
};

const baseUrl = `${config.baseUrl}?serviceAgreementID=${config.serivceAgreement}&customerId=${config.customerId}&index=-`;

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