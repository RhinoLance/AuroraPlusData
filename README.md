# AuroraPlusData
Tools to extract and model Aurora+ usage across different plans.

This project arose out of an interest in knowing if our household would be better off switching to the Peak / Off-Peak tarrif, rather than the fixed T31 and T41 tarrifs.

To use it, you will need to be an existing Aurora+ customer on the fixed tarrif.

It will download your historical usage data, then work out for each day, how much energy you used in the peak and off-peak times.  It will then calculate what you would have paid on each plan.

### Guarantee and Suitability
This is provided with no guaranty of accuracy or suitability for its stated purpose.  i.e. If you make financial decisions based on the output of these tools, they are your decision alone.  To emphasise the point, note that this software has no tests or sanity checking, which would be non-negotiables on any commercial software I write.
## Instructions:

### Finding Aurora+ parameters.

To keep this project simple, it does not authenticate you with Aurora+, but rather requires you to authenticate and manually extract some key values.

1. Open the Aurora+ app on your computer using Edge or Chrome, and login. (https://my.auroraenergy.com.au/)
2. Open the DevTools window by pressing [Ctrl]+[Shift]+[I]
3. GoTo the Network tab, and select the Fetch/XHR filter

![DevTools Network tab](documentation/images/devToolsNetworkTab.png)

4. In the browser, navigate to the usage view, and ensure you're viewing usage by Day.

![Aurora+ daily usage](documentation/images/auroraPlusDaily.png)

5. In the DevTools window, you should see a series of network requests.  Look for  one that starts with: `day?serviceAgreementId`.  Copy and save for later, the numeric values of serviceAgreementId and customerId.

![Extract serviceAgreement and customerId](documentation/images/devToolsParameterExtract.png)

6. Click the `day?` line, and select the Headers tab.

![Extract bearer token](documentation/images/devToolsToken.png)

7.  Look for the Authorization field.  Copy and save for later, the bearer token value (excluding the proceeding "bearer " text)

Note that the bearer token will change after a period of time. As such, if you come back after several days, you may need to check the token value hasn't changed.  Also, it should stand to reason, don't share this value with anyone else.  It is what tells the Aurora+ servers that you are you.

### Installing and configuring the downloader.
1. Install Node if it's not already installed (https://nodejs.org/) on your computer.
2. Download this project, and open a terminal in its root.
3. Install project dependencies by executing: `npm i`.
4. Edit config.js, and substiture the following for the values identified earlier:
	a) YOUR_BEARER_TOKEN
	b) YOUR_SERVICE_AGREEMENT_ID
	c) YOUR_CUSTOMER_ID
5. Verify that the tarrifs in config.js match Aurora's current tarrifs.  If not, update them.

## Running the software.

### Download Hourly Usage.
This tool downloads raw Aurora+ daily usage.

By default the last 365 days of usage will be downloaded.  This can be altered with the `numDaysToRetrieve` config parameter.

From a command prompt in the project root, execute the following command:

`node downloadHourlyUsage.js`

This will take a while to complete, but will save the JSON response to `output.json` which contains the raw daily data.

### Compute daily usage.
This tool uses the raw data download, and generates a CSV with peak, off-peak, T31 and T41 usage stats on a daily basis, which can be further analysed in Excel or other tooling.

From the command prompt in the project root, execute the follwoing command:

`node computeDailyUsage.js`

The output will be saved to `daySummary.csv`.

The outputted spreadsheet contains the following columns:
- Peak T31: Energy used during the peak period on the T31 meter.
- Off Peak T31: Energy used during the off-peak period on the T31 meter.
- Peak T41: *as above for T41*
- Off Peak T41: *as above for T41*

- Peak Total kWh: The total energy used during the peak period.
- Off Peak Total kWh: The total energy used diring the off-peak period.
- T31 Total kWh: The total energy used by the T31 meter.
- T41 Total kWh: The total energy used by the T41 meter.

- Peak Total $: The total cost during the peak period.
- Off Peak Total $: The total cost diring the off-peak period.
- T31 Total $: The total cost of the T31 meter.
- T41 Total $: The total cost of the T41 meter.

- P-OP Total $: The total cost if charged on the peak/off-peak plan
- Flat Total $: The total cost if charged on the flat rate plan.
- P-OP Savings $: The total savings of the peak/off-peak plan over the flat rate plan. (positive numbers shows money saved, negative numbers shows money lost).