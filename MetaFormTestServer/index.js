var express = require("express");
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//allow OPTIONS on all resources
app.options('*', cors());
app.post('*', cors());


app.get("/country", cors(), (req, res, next) => {
    res.json([
        { code: 'AX', description: `Aaland Islands` },
        { code: 'AF', description: `Afghanistan` },
        { code: 'AL', description: `Albania` },
        { code: 'DZ', description: `Algeria` },
        { code: 'AS', description: `American Samoa` },
        { code: 'AD', description: `Andorra` },
        { code: 'AO', description: `Angola` },
        { code: 'AI', description: `Anguilla` },
        { code: 'AQ', description: `Antarctica` },
        { code: 'AG', description: `Antigua And Barbuda` },
        { code: 'AR', description: `Argentina` },
        { code: 'AM', description: `Armenia` },
        { code: 'AW', description: `Aruba` },
        { code: 'AU', description: `Australia` },
        { code: 'AT', description: `Austria` },
        { code: 'AZ', description: `Azerbaijan` },
        { code: 'BS', description: `Bahamas` },
        { code: 'BH', description: `Bahrain` },
        { code: 'BD', description: `Bangladesh` },
        { code: 'BB', description: `Barbados` },
        { code: 'BY', description: `Belarus` },
        { code: 'BE', description: `Belgium` },
        { code: 'BZ', description: `Belize` },
        { code: 'BJ', description: `Benin` },
        { code: 'BM', description: `Bermuda` },
        { code: 'BT', description: `Bhutan` },
        { code: 'BO', description: `Bolivia` },
        { code: 'BA', description: `Bosnia` },
        { code: 'BW', description: `Botswana` },
        { code: 'BV', description: `Bouvet Island` },
        { code: 'BR', description: `Brazil` },
        { code: 'IO', description: `British Indian Ocean Territory` },
        { code: 'BN', description: `Brunei Darussalam` },
        { code: 'BG', description: `Bulgaria` },
        { code: 'BF', description: `Burkina Faso` },
        { code: 'BI', description: `Burundi` },
        { code: 'KH', description: `Cambodia` },
        { code: 'CM', description: `Cameroon` },
        { code: 'CA', description: `Canada` },
        { code: 'CV', description: `Cape Verde` },
        { code: 'KY', description: `Cayman Islands` },
        { code: 'CF', description: `Central African Republic` },
        { code: 'TD', description: `Chad` },
        { code: 'CL', description: `Chile` },
        { code: 'CN', description: `China` },
        { code: 'CX', description: `Christmas Island` },
        { code: 'CC', description: `Cocos (Keeling) Islands` },
        { code: 'CO', description: `Colombia` },
        { code: 'KM', description: `Comoros` },
        { code: 'CD', description: `Congo, Democratic Republic of` },
        { code: 'CG', description: `Congo, Republic Of` },
        { code: 'CK', description: `Cook Islands` },
        { code: 'CR', description: `Costa Rica` },
        { code: 'CI', description: `Cote D'Ivoire` },
        { code: 'HR', description: `Croatia` },
        { code: 'CU', description: `Cuba` },
        { code: 'CY', description: `Cyprus` },
        { code: 'CZ', description: `Czech Republic` },
        { code: 'DK', description: `Denmark` },
        { code: 'DJ', description: `Djibouti` },
        { code: 'DM', description: `Dominica` },
        { code: 'DO', description: `Dominican Republic` },
        { code: 'EC', description: `Ecuador` },
        { code: 'EG', description: `Egypt` },
        { code: 'SV', description: `El Salvador` },
        { code: 'GQ', description: `Equatorial Guinea` },
        { code: 'ER', description: `Eritrea` },
        { code: 'EE', description: `Estonia` },
        { code: 'ET', description: `Ethiopia` },
        { code: 'FK', description: `Falkland Islands` },
        { code: 'FO', description: `Faroe Islands` },
        { code: 'FJ', description: `Fiji` },
        { code: 'FI', description: `Finland` },
        { code: 'FR', description: `France` },
        { code: 'GF', description: `French Guiana` },
        { code: 'PF', description: `French Polynesia` },
        { code: 'TF', description: `French Southern Territories` },
        { code: 'GA', description: `Gabon` },
        { code: 'GM', description: `Gambia` },
        { code: 'GE', description: `Georgia` },
        { code: 'DE', description: `Germany` },
        { code: 'GH', description: `Ghana` },
        { code: 'GI', description: `Gibraltar` },
        { code: 'GR', description: `Greece` },
        { code: 'GL', description: `Greenland` },
        { code: 'GD', description: `Grenada` },
        { code: 'GP', description: `Guadeloupe` },
        { code: 'GU', description: `Guam` },
        { code: 'GT', description: `Guatemala` },
        { code: 'GN', description: `Guinea` },
        { code: 'GW', description: `Guinea-Bissau` },
        { code: 'GY', description: `Guyana` },
        { code: 'HT', description: `Haiti` },
        { code: 'HM', description: `Heard And Mc Donald Islands` },
        { code: 'HN', description: `Honduras` },
        { code: 'HK', description: `Hong Kong` },
        { code: 'HU', description: `Hungary` },
        { code: 'IS', description: `Iceland` },
        { code: 'IN', description: `India` },
        { code: 'ID', description: `Indonesia` },
        { code: 'IR', description: `Iran (Islamic Republic of)` },
        { code: 'IQ', description: `Iraq` },
        { code: 'IE', description: `Ireland` },
        { code: 'IL', description: `Israel` },
        { code: 'IT', description: `Italy` },
        { code: 'JM', description: `Jamaica` },
        { code: 'JP', description: `Japan` },
        { code: 'JO', description: `Jordan` },
        { code: 'KZ', description: `Kazakhstan` },
        { code: 'KE', description: `Kenya` },
        { code: 'KI', description: `Kiribati` },
        { code: 'XK', description: `Kosovo` },
        { code: 'KW', description: `Kuwait` },
        { code: 'KG', description: `Kyrgyzstan` },
        { code: 'LA', description: `Lao People's Democratic Republic` },
        { code: 'LV', description: `Latvia` },
        { code: 'LB', description: `Lebanon` },
        { code: 'LS', description: `Lesotho` },
        { code: 'LR', description: `Liberia` },
        { code: 'LY', description: `Libyan Arab Jamahiriya` },
        { code: 'LI', description: `Liechtenstein` },
        { code: 'LT', description: `Lithuania` },
        { code: 'LU', description: `Luxembourg` },
        { code: 'MO', description: `Macau` },
        { code: 'MK', description: `Macedonia` },
        { code: 'MG', description: `Madagascar` },
        { code: 'MW', description: `Malawi` },
        { code: 'MY', description: `Malaysia` },
        { code: 'MV', description: `Maldives` },
        { code: 'ML', description: `Mali` },
        { code: 'MT', description: `Malta` },
        { code: 'MH', description: `Marshall Islands` },
        { code: 'MQ', description: `Martinique` },
        { code: 'MR', description: `Mauritania` },
        { code: 'MU', description: `Mauritius` },
        { code: 'YT', description: `Mayotte` },
        { code: 'MX', description: `Mexico` },
        { code: 'FM', description: `Micronesia, Federated States of` },
        { code: 'MD', description: `Moldova` },
        { code: 'MC', description: `Monaco` },
        { code: 'MN', description: `Mongolia` },
        { code: 'ME', description: `Montenegro` },
        { code: 'MS', description: `Montserrat` },
        { code: 'MA', description: `Morocco` },
        { code: 'MZ', description: `Mozambique` },
        { code: 'MM', description: `Myanmar` },
        { code: 'NA', description: `Namibia` },
        { code: 'NR', description: `Nauru` },
        { code: 'NP', description: `Nepal` },
        { code: 'NL', description: `Netherlands` },
        { code: 'AN', description: `Netherlands Antilles` },
        { code: 'NC', description: `New Caledonia` },
        { code: 'NZ', description: `New Zealand` },
        { code: 'NI', description: `Nicaragua` },
        { code: 'NE', description: `Niger` },
        { code: 'NG', description: `Nigeria` },
        { code: 'NU', description: `Niue` },
        { code: 'NF', description: `Norfolk Island` },
        { code: 'KP', description: `North Korea` },
        { code: 'MP', description: `Northern Mariana Islands` },
        { code: 'NO', description: `Norway` },
        { code: 'OM', description: `Oman` },
        { code: 'PK', description: `Pakistan` },
        { code: 'PW', description: `Palau` },
        { code: 'PS', description: `Palestinian Territory` },
        { code: 'PA', description: `Panama` },
        { code: 'PG', description: `Papua New Guinea` },
        { code: 'PY', description: `Paraguay` },
        { code: 'PE', description: `Peru` },
        { code: 'PH', description: `Philippines` },
        { code: 'PN', description: `Pitcairn` },
        { code: 'PL', description: `Poland` },
        { code: 'PT', description: `Portugal` },
        { code: 'PR', description: `Puerto Rico` },
        { code: 'QA', description: `Qatar` },
        { code: 'RE', description: `Reunion` },
        { code: 'RO', description: `Romania` },
        { code: 'RU', description: `Russia` },
        { code: 'RW', description: `Rwanda` },
        { code: 'SH', description: `Saint Helena` },
        { code: 'KN', description: `Saint Kitts And Nevis` },
        { code: 'LC', description: `Saint Lucia` },
        { code: 'PM', description: `Saint Pierre And Miquelon` },
        { code: 'WS', description: `Samoa` },
        { code: 'SM', description: `San Marino` },
        { code: 'ST', description: `Sao Tome And Principe` },
        { code: 'SA', description: `Saudi Arabia` },
        { code: 'SN', description: `Senegal` },
        { code: 'CS', description: `Serbia` },
        { code: 'SC', description: `Seychelles` },
        { code: 'SL', description: `Sierra Leone` },
        { code: 'SG', description: `Singapore` },
        { code: 'SK', description: `Slovakia` },
        { code: 'SI', description: `Slovenia` },
        { code: 'SB', description: `Solomon Islands` },
        { code: 'SO', description: `Somalia` },
        { code: 'ZA', description: `South Africa` },
        { code: 'GS', description: `South Georgia` },
        { code: 'KR', description: `South Korea` },
        { code: 'ES', description: `Spain` },
        { code: 'LK', description: `Sri Lanka` },
        { code: 'VC', description: `St. Vincent` },
        { code: 'SD', description: `Sudan` },
        { code: 'SR', description: `Suriname` },
        { code: 'SJ', description: `Svalbard And Jan Mayen Islands` },
        { code: 'SZ', description: `Swaziland` },
        { code: 'SE', description: `Sweden` },
        { code: 'CH', description: `Switzerland` },
        { code: 'SY', description: `Syrian Arab Republic` },
        { code: 'TW', description: `Taiwan` },
        { code: 'TJ', description: `Tajikistan` },
        { code: 'TZ', description: `Tanzania, United Republic of` },
        { code: 'TH', description: `Thailand` },
        { code: 'TL', description: `Timor-Leste` },
        { code: 'TG', description: `Togo` },
        { code: 'TK', description: `Tokelau` },
        { code: 'TO', description: `Tonga` },
        { code: 'TT', description: `Trinidad And Tobago` },
        { code: 'TN', description: `Tunisia` },
        { code: 'TR', description: `Turkey` },
        { code: 'TM', description: `Turkmenistan` },
        { code: 'TC', description: `Turks And Caicos Islands` },
        { code: 'TV', description: `Tuvalu` },
        { code: 'UG', description: `Uganda` },
        { code: 'UA', description: `Ukraine` },
        { code: 'AE', description: `United Arab Emirates` },
        { code: 'GB', description: `United Kingdom` },
        { code: 'US', description: `United States` },
        { code: 'UM', description: `United States Minor Outlying Islands` },
        { code: 'UY', description: `Uruguay` },
        { code: 'UZ', description: `Uzbekistan` },
        { code: 'VU', description: `Vanuatu` },
        { code: 'VA', description: `Vatican City State (Holy See)` },
        { code: 'VE', description: `Venezuela` },
        { code: 'VN', description: `Viet Nam` },
        { code: 'VG', description: `Virgin Islands (British)` },
        { code: 'VI', description: `Virgin Islands (U.S.)` },
        { code: 'WF', description: `Wallis And Futuna Islands` },
        { code: 'EH', description: `Western Sahara` },
        { code: 'YE', description: `Yemen` },
        { code: 'ZM', description: `Zambia` },
        { code: 'ZW', description: `Zimbabwe` }
    ]);
});

app.get("/country/:countryCode/regions", cors(), (req, res, next) => {
    var countryCode = req.params.countryCode.toUpperCase();
    if (countryCode === 'UK') {
        res.json([
            { 'code': '1', 'description': 'Scotland' },
            { 'code': '2', 'description': 'Northern Ireland' },
            { 'code': '3', 'description': 'Wales' },
            { 'code': '4', 'description': 'England' }
        ]);
    } else if (countryCode === 'DE') {
        res.json([
            { 'code': '5', 'description': 'Baden-Württemberg' },
            { 'code': '6', 'description': 'Bavaria' },
            { 'code': '7', 'description': 'Berlin' },
            { 'code': '8', 'description': 'Hamburg' },
            { 'code': '9', 'description': 'Bremen' },
            { 'code': '10', 'description': 'Saxony' },
            { 'code': '11', 'description': 'North Rhine-Westphalia' }
        ]);
    } else {
        res.json([
        ]);
    }
});

app.get('/leads/source', cors(), (req, res, next) => {
    res.json([
        { code: 'FR001', description: `A Friend` },
        { code: 'AD001', description: `Advertisement` },
        { code: 'WEB008', description: `Camp America Website` },
        { code: 'CAD001', description: `Careers Advisor/Tutor` },
        { code: 'APP001', description: `Current/Past Applicant` },
        { code: 'EM001', description: `Email` },
        { code: 'EX002', description: `Event` },
        { code: 'EX001', description: `Fair / Exhibition` },
        { code: 'WEB009', description: `GET Australia` },
        { code: 'MAG001', description: `Glamour Magazine` },
        { code: 'GO001', description: `Google` },
        { code: 'IN001', description: `Info Meeting` },
        { code: 'WEB010', description: `Jobsite` },
        { code: 'LE001', description: `Leaflet/Brochure/Poster` },
        { code: 'WEB004', description: `Nursery World` },
        { code: 'SOC001', description: `Social Networking` },
        { code: 'WEB007', description: `UCAS` },
        { code: 'GG001', description: `UK Graduate Guide` },
        { code: 'OO000', description: `Other` }
    ]);
});

app.get('/leads/source/other', cors(), (req, res, next) => {
    res.json([
        { code: '0', description: `Registration` },
        { code: '1', description: `Brochure Request` },
        { code: '2', description: `Polish Marketing Website` },
        { code: '3', description: `German Marketing Website` },
    ]);
});


app.post("/validate/email", cors(), (req, res, next) => {
    var check = req.body.check.toLowerCase();
    // console.log(`Validate email called with '${check}'`);

    if (check === 'fail@example.com') {
        res.json(
            { 'valid': false }
        );
    } else {
        res.json(
            { 'valid': true }
        );
    }
});

app.get("/form/:formName", cors(), (req, res, next) => {
    // console.log(`Looking for ${req.params.formName.toLowerCase()}.json in ${__dirname}/forms`);
    res.sendFile(path.join(__dirname, '/forms', `${req.params.formName.toLowerCase()}.json`));
});

app.get("/rules", cors(), (req, res, next) => {
    res.sendFile(path.join(__dirname, '/forms', `rules.json`));
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
})