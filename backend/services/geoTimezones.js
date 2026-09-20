/**
 * Which country a time zone belongs to.
 *
 * The visitor's browser reports its IANA time zone ("Europe/Paris"), and that
 * is all the platform needs to say a visit came from France. Nothing is looked
 * up over the network, no IP database is shipped, and the visitor's address is
 * never sent anywhere — the zone is a far coarser, and far less personal,
 * signal than an IP address.
 *
 * A proxy that already knows the country (Cloudflare's CF-IPCountry) wins over
 * this table; see analyticsService.
 */

// country → its zones. Written this way because it is easier to check by eye.
const BY_COUNTRY = {
    CI: ['Africa/Abidjan'], GH: ['Africa/Accra'], ET: ['Africa/Addis_Ababa'], DZ: ['Africa/Algiers'],
    ER: ['Africa/Asmara'], ML: ['Africa/Bamako'], CF: ['Africa/Bangui'], GM: ['Africa/Banjul'],
    GW: ['Africa/Bissau'], MW: ['Africa/Blantyre'], CG: ['Africa/Brazzaville'], BI: ['Africa/Bujumbura'],
    EG: ['Africa/Cairo'], MA: ['Africa/Casablanca'], GN: ['Africa/Conakry'], SN: ['Africa/Dakar'],
    TZ: ['Africa/Dar_es_Salaam'], DJ: ['Africa/Djibouti'], CM: ['Africa/Douala'], EH: ['Africa/El_Aaiun'],
    SL: ['Africa/Freetown'], BW: ['Africa/Gaborone'], ZW: ['Africa/Harare'], ZA: ['Africa/Johannesburg'],
    SS: ['Africa/Juba'], UG: ['Africa/Kampala'], SD: ['Africa/Khartoum'], RW: ['Africa/Kigali'],
    CD: ['Africa/Kinshasa', 'Africa/Lubumbashi'], NG: ['Africa/Lagos'], GA: ['Africa/Libreville'],
    TG: ['Africa/Lome'], AO: ['Africa/Luanda'], ZM: ['Africa/Lusaka'], GQ: ['Africa/Malabo'],
    MZ: ['Africa/Maputo'], LS: ['Africa/Maseru'], SZ: ['Africa/Mbabane'], SO: ['Africa/Mogadishu'],
    LR: ['Africa/Monrovia'], KE: ['Africa/Nairobi'], TD: ['Africa/Ndjamena'], NE: ['Africa/Niamey'],
    MR: ['Africa/Nouakchott'], BF: ['Africa/Ouagadougou'], BJ: ['Africa/Porto-Novo'], ST: ['Africa/Sao_Tome'],
    LY: ['Africa/Tripoli'], TN: ['Africa/Tunis'], NA: ['Africa/Windhoek'],

    US: ['America/Adak', 'America/Anchorage', 'America/Boise', 'America/Chicago', 'America/Denver',
        'America/Detroit', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo',
        'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay',
        'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Juneau', 'America/Kentucky/Louisville',
        'America/Kentucky/Monticello', 'America/Los_Angeles', 'America/Menominee', 'America/Metlakatla',
        'America/New_York', 'America/Nome', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem', 'America/Phoenix', 'America/Sitka', 'America/Yakutat',
        'Pacific/Honolulu'],
    CA: ['America/Atikokan', 'America/Blanc-Sablon', 'America/Cambridge_Bay', 'America/Creston',
        'America/Dawson', 'America/Dawson_Creek', 'America/Edmonton', 'America/Fort_Nelson',
        'America/Glace_Bay', 'America/Goose_Bay', 'America/Halifax', 'America/Inuvik', 'America/Iqaluit',
        'America/Moncton', 'America/Rankin_Inlet', 'America/Regina', 'America/Resolute', 'America/St_Johns',
        'America/Swift_Current', 'America/Toronto', 'America/Vancouver', 'America/Whitehorse',
        'America/Winnipeg'],
    MX: ['America/Bahia_Banderas', 'America/Cancun', 'America/Chihuahua', 'America/Ciudad_Juarez',
        'America/Hermosillo', 'America/Matamoros', 'America/Mazatlan', 'America/Merida', 'America/Mexico_City',
        'America/Monterrey', 'America/Ojinaga', 'America/Tijuana'],
    BR: ['America/Araguaina', 'America/Bahia', 'America/Belem', 'America/Boa_Vista', 'America/Campo_Grande',
        'America/Cuiaba', 'America/Eirunepe', 'America/Fortaleza', 'America/Maceio', 'America/Manaus',
        'America/Noronha', 'America/Porto_Velho', 'America/Recife', 'America/Rio_Branco', 'America/Santarem',
        'America/Sao_Paulo'],
    AR: ['America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba',
        'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza',
        'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan',
        'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia'],
    AI: ['America/Anguilla'], AG: ['America/Antigua'], AW: ['America/Aruba'], PY: ['America/Asuncion'],
    BB: ['America/Barbados'], BZ: ['America/Belize'], BO: ['America/La_Paz'], CO: ['America/Bogota'],
    VE: ['America/Caracas'], GF: ['America/Cayenne'], KY: ['America/Cayman'], CR: ['America/Costa_Rica'],
    CU: ['America/Havana'], CW: ['America/Curacao'], DM: ['America/Dominica'], DO: ['America/Santo_Domingo'],
    EC: ['America/Guayaquil', 'Pacific/Galapagos'], SV: ['America/El_Salvador'], GD: ['America/Grenada'],
    GP: ['America/Guadeloupe'], GT: ['America/Guatemala'], GY: ['America/Guyana'], HT: ['America/Port-au-Prince'],
    HN: ['America/Tegucigalpa'], JM: ['America/Jamaica'], MQ: ['America/Martinique'], MS: ['America/Montserrat'],
    NI: ['America/Managua'], PA: ['America/Panama'], PE: ['America/Lima'], PR: ['America/Puerto_Rico'],
    SR: ['America/Paramaribo'], TC: ['America/Grand_Turk'], TT: ['America/Port_of_Spain'], UY: ['America/Montevideo'],
    VG: ['America/Tortola'], VI: ['America/St_Thomas'], BS: ['America/Nassau'], BQ: ['America/Kralendijk'],
    SX: ['America/Lower_Princes'], MF: ['America/Marigot'], BL: ['America/St_Barthelemy'], KN: ['America/St_Kitts'],
    LC: ['America/St_Lucia'], VC: ['America/St_Vincent'], PM: ['America/Miquelon'],
    GL: ['America/Danmarkshavn', 'America/Nuuk', 'America/Scoresbysund', 'America/Thule'],
    CL: ['America/Punta_Arenas', 'America/Santiago', 'Pacific/Easter'],

    YE: ['Asia/Aden'], KZ: ['Asia/Almaty', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Atyrau', 'Asia/Oral',
        'Asia/Qostanay', 'Asia/Qyzylorda'],
    JO: ['Asia/Amman'], TM: ['Asia/Ashgabat'], IQ: ['Asia/Baghdad'], BH: ['Asia/Bahrain'], AZ: ['Asia/Baku'],
    TH: ['Asia/Bangkok'], LB: ['Asia/Beirut'], KG: ['Asia/Bishkek'], BN: ['Asia/Brunei'], MN: ['Asia/Choibalsan',
        'Asia/Hovd', 'Asia/Ulaanbaatar'],
    LK: ['Asia/Colombo'], SY: ['Asia/Damascus'], BD: ['Asia/Dhaka'], TL: ['Asia/Dili'], AE: ['Asia/Dubai'],
    TJ: ['Asia/Dushanbe'], CY: ['Asia/Famagusta', 'Asia/Nicosia'], PS: ['Asia/Gaza', 'Asia/Hebron'],
    VN: ['Asia/Ho_Chi_Minh'], HK: ['Asia/Hong_Kong'], ID: ['Asia/Jakarta', 'Asia/Jayapura', 'Asia/Makassar',
        'Asia/Pontianak'],
    IL: ['Asia/Jerusalem'], AF: ['Asia/Kabul'], PK: ['Asia/Karachi'], NP: ['Asia/Kathmandu'], IN: ['Asia/Kolkata'],
    MY: ['Asia/Kuala_Lumpur', 'Asia/Kuching'], KW: ['Asia/Kuwait'], MO: ['Asia/Macau'], PH: ['Asia/Manila'],
    OM: ['Asia/Muscat'], KH: ['Asia/Phnom_Penh'], KP: ['Asia/Pyongyang'], QA: ['Asia/Qatar'], SA: ['Asia/Riyadh'],
    UZ: ['Asia/Samarkand', 'Asia/Tashkent'], KR: ['Asia/Seoul'], CN: ['Asia/Shanghai', 'Asia/Urumqi'],
    SG: ['Asia/Singapore'], TW: ['Asia/Taipei'], GE: ['Asia/Tbilisi'], IR: ['Asia/Tehran'], BT: ['Asia/Thimphu'],
    JP: ['Asia/Tokyo'], LA: ['Asia/Vientiane'], MM: ['Asia/Yangon'], AM: ['Asia/Yerevan'],
    RU: ['Asia/Anadyr', 'Asia/Barnaul', 'Asia/Chita', 'Asia/Irkutsk', 'Asia/Kamchatka', 'Asia/Khandyga',
        'Asia/Krasnoyarsk', 'Asia/Magadan', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk',
        'Asia/Sakhalin', 'Asia/Srednekolymsk', 'Asia/Tomsk', 'Asia/Ust-Nera', 'Asia/Vladivostok',
        'Asia/Yakutsk', 'Asia/Yekaterinburg', 'Europe/Astrakhan', 'Europe/Kaliningrad', 'Europe/Kirov',
        'Europe/Moscow', 'Europe/Samara', 'Europe/Saratov', 'Europe/Ulyanovsk', 'Europe/Volgograd'],

    PT: ['Atlantic/Azores', 'Atlantic/Madeira', 'Europe/Lisbon'], BM: ['Atlantic/Bermuda'],
    ES: ['Atlantic/Canary', 'Africa/Ceuta', 'Europe/Madrid'], CV: ['Atlantic/Cape_Verde'],
    FO: ['Atlantic/Faroe'], IS: ['Atlantic/Reykjavik'], GS: ['Atlantic/South_Georgia'],
    SH: ['Atlantic/St_Helena'], FK: ['Atlantic/Stanley'],

    AU: ['Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Darwin',
        'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe',
        'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney'],

    NL: ['Europe/Amsterdam'], AD: ['Europe/Andorra'], GR: ['Europe/Athens'], RS: ['Europe/Belgrade'],
    DE: ['Europe/Berlin', 'Europe/Busingen'], SK: ['Europe/Bratislava'], BE: ['Europe/Brussels'],
    RO: ['Europe/Bucharest'], HU: ['Europe/Budapest'], MD: ['Europe/Chisinau'], DK: ['Europe/Copenhagen'],
    IE: ['Europe/Dublin'], GI: ['Europe/Gibraltar'], GG: ['Europe/Guernsey'], FI: ['Europe/Helsinki'],
    IM: ['Europe/Isle_of_Man'], TR: ['Europe/Istanbul'], JE: ['Europe/Jersey'], UA: ['Europe/Kyiv',
        'Europe/Simferopol'],
    SI: ['Europe/Ljubljana'], GB: ['Europe/London'], LU: ['Europe/Luxembourg'], MT: ['Europe/Malta'],
    AX: ['Europe/Mariehamn'], BY: ['Europe/Minsk'], MC: ['Europe/Monaco'], NO: ['Europe/Oslo'],
    FR: ['Europe/Paris'], ME: ['Europe/Podgorica'], CZ: ['Europe/Prague'], LV: ['Europe/Riga'],
    IT: ['Europe/Rome'], SM: ['Europe/San_Marino'], BA: ['Europe/Sarajevo'], MK: ['Europe/Skopje'],
    BG: ['Europe/Sofia'], SE: ['Europe/Stockholm'], EE: ['Europe/Tallinn'], AL: ['Europe/Tirane'],
    LI: ['Europe/Vaduz'], VA: ['Europe/Vatican'], AT: ['Europe/Vienna'], LT: ['Europe/Vilnius'],
    PL: ['Europe/Warsaw'], HR: ['Europe/Zagreb'], CH: ['Europe/Zurich'],

    MG: ['Indian/Antananarivo'], IO: ['Indian/Chagos'], CX: ['Indian/Christmas'], CC: ['Indian/Cocos'],
    KM: ['Indian/Comoro'], TF: ['Indian/Kerguelen'], SC: ['Indian/Mahe'], MV: ['Indian/Maldives'],
    MU: ['Indian/Mauritius'], YT: ['Indian/Mayotte'], RE: ['Indian/Reunion'],

    WS: ['Pacific/Apia'], NZ: ['Pacific/Auckland', 'Pacific/Chatham'], PG: ['Pacific/Bougainville',
        'Pacific/Port_Moresby'],
    FM: ['Pacific/Chuuk', 'Pacific/Kosrae', 'Pacific/Pohnpei'], VU: ['Pacific/Efate'], TK: ['Pacific/Fakaofo'],
    FJ: ['Pacific/Fiji'], TV: ['Pacific/Funafuti'], PF: ['Pacific/Gambier', 'Pacific/Marquesas', 'Pacific/Tahiti'],
    SB: ['Pacific/Guadalcanal'], GU: ['Pacific/Guam'], KI: ['Pacific/Kanton', 'Pacific/Kiritimati', 'Pacific/Tarawa'],
    MH: ['Pacific/Kwajalein', 'Pacific/Majuro'], NR: ['Pacific/Nauru'], NU: ['Pacific/Niue'], NF: ['Pacific/Norfolk'],
    NC: ['Pacific/Noumea'], AS: ['Pacific/Pago_Pago'], PW: ['Pacific/Palau'], PN: ['Pacific/Pitcairn'],
    CK: ['Pacific/Rarotonga'], MP: ['Pacific/Saipan'], TO: ['Pacific/Tongatapu'], UM: ['Pacific/Midway', 'Pacific/Wake'],
    WF: ['Pacific/Wallis'], AQ: ['Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/Mawson',
        'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa',
        'Antarctica/Troll', 'Antarctica/Vostok'],
};

const ZONE_TO_COUNTRY = new Map();
for (const [country, zones] of Object.entries(BY_COUNTRY)) {
    zones.forEach(zone => ZONE_TO_COUNTRY.set(zone.toLowerCase(), country));
}

// Names some browsers still report for zones that were renamed.
const ALIASES = {
    'asia/calcutta': 'IN', 'asia/katmandu': 'NP', 'asia/saigon': 'VN', 'asia/rangoon': 'MM',
    'asia/chongqing': 'CN', 'asia/harbin': 'CN', 'asia/macao': 'MO', 'asia/istanbul': 'TR',
    'asia/tel_aviv': 'IL', 'asia/thimbu': 'BT', 'asia/ashkhabad': 'TM', 'asia/dacca': 'BD',
    'europe/kiev': 'UA', 'europe/uzhgorod': 'UA', 'europe/zaporozhye': 'UA', 'europe/nicosia': 'CY',
    'europe/belfast': 'GB', 'gb': 'GB', 'gb-eire': 'GB', 'eire': 'IE', 'portugal': 'PT', 'poland': 'PL',
    'america/godthab': 'GL', 'america/montreal': 'CA', 'america/nipigon': 'CA', 'america/rainy_river': 'CA',
    'america/thunder_bay': 'CA', 'america/yellowknife': 'CA', 'america/pangnirtung': 'CA',
    'america/santa_isabel': 'MX', 'america/ensenada': 'MX', 'america/mexico_city': 'MX',
    'america/buenos_aires': 'AR', 'america/cordoba': 'AR', 'america/rosario': 'AR', 'america/catamarca': 'AR',
    'america/jujuy': 'AR', 'america/mendoza': 'AR', 'america/porto_acre': 'BR', 'brazil/east': 'BR',
    'america/atka': 'US', 'america/fort_wayne': 'US', 'america/indianapolis': 'US', 'america/knox_in': 'US',
    'america/louisville': 'US', 'america/shiprock': 'US', 'navajo': 'US', 'us/alaska': 'US',
    'us/aleutian': 'US', 'us/arizona': 'US', 'us/central': 'US', 'us/east-indiana': 'US', 'us/eastern': 'US',
    'us/hawaii': 'US', 'us/indiana-starke': 'US', 'us/michigan': 'US', 'us/mountain': 'US', 'us/pacific': 'US',
    'us/samoa': 'AS', 'canada/atlantic': 'CA', 'canada/central': 'CA', 'canada/eastern': 'CA',
    'canada/mountain': 'CA', 'canada/newfoundland': 'CA', 'canada/pacific': 'CA', 'canada/saskatchewan': 'CA',
    'canada/yukon': 'CA', 'mexico/bajanorte': 'MX', 'mexico/bajasur': 'MX', 'mexico/general': 'MX',
    'australia/act': 'AU', 'australia/canberra': 'AU', 'australia/nsw': 'AU', 'australia/north': 'AU',
    'australia/queensland': 'AU', 'australia/south': 'AU', 'australia/tasmania': 'AU',
    'australia/victoria': 'AU', 'australia/west': 'AU', 'australia/yancowinna': 'AU',
    'australia/currie': 'AU', 'pacific/johnston': 'UM', 'pacific/ponape': 'FM', 'pacific/truk': 'FM',
    'pacific/samoa': 'AS', 'pacific/enderbury': 'KI', 'pacific/yap': 'FM', 'nz': 'NZ', 'nz-chat': 'NZ',
    'atlantic/jan_mayen': 'NO', 'arctic/longyearbyen': 'NO', 'africa/asmera': 'ER', 'africa/timbuktu': 'ML',
    'egypt': 'EG', 'israel': 'IL', 'iran': 'IR', 'japan': 'JP', 'singapore': 'SG', 'hongkong': 'HK',
    'prc': 'CN', 'roc': 'TW', 'rok': 'KR', 'turkey': 'TR', 'cuba': 'CU', 'jamaica': 'JM', 'libya': 'LY',
    'chile/continental': 'CL', 'chile/easterisland': 'CL', 'w-su': 'RU',
};

// Fallbacks for a whole family, when a zone we don't know starts with one of these.
const PREFIXES = [
    ['us/', 'US'], ['canada/', 'CA'], ['mexico/', 'MX'], ['brazil/', 'BR'], ['chile/', 'CL'],
    ['australia/', 'AU'], ['america/argentina/', 'AR'], ['america/indiana/', 'US'],
    ['america/kentucky/', 'US'], ['america/north_dakota/', 'US'], ['antarctica/', 'AQ'],
];

/**
 * The ISO country code for an IANA time zone, or null when it says nothing
 * (UTC, GMT+2, an unknown or made-up name).
 */
function countryForTimezone(timezone) {
    if (typeof timezone !== 'string') return null;
    const zone = timezone.trim().toLowerCase();
    if (!zone || zone.length > 60 || !/^[a-z0-9+_\-/]+$/.test(zone)) return null;
    if (zone === 'utc' || zone === 'gmt' || zone.startsWith('etc/')) return null;

    return ZONE_TO_COUNTRY.get(zone)
        || ALIASES[zone]
        || PREFIXES.find(([prefix]) => zone.startsWith(prefix))?.[1]
        || null;
}

module.exports = { countryForTimezone, ZONE_COUNT: ZONE_TO_COUNTRY.size };
