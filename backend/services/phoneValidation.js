/**
 * Country calling codes, WhatsApp number normalization/validation (E.164),
 * and French CEFR level validation for website learner registration & profile.
 */

const NANP = { dial: '+1', min: 10, max: 10, trunkZero: false, ex: '514 555 0199' };

/**
 * [dial, minNationalDigits, maxNationalDigits, dropLeadingTrunkZero, example]
 * Kept in sync with frontend/src/learn/account/phone.ts and countries.ts.
 */
const RAW = {
    // North America & Caribbean (NANP +1)
    CA: ['+1', 10, 10, false, '514 555 0199'],
    US: ['+1', 10, 10, false, '415 555 0199'],
    AG: ['+1', 10, 10, false, '268 464 1234'], AI: ['+1', 10, 10, false, '264 497 1234'],
    AS: ['+1', 10, 10, false, '684 699 1234'], BB: ['+1', 10, 10, false, '246 250 1234'],
    BM: ['+1', 10, 10, false, '441 370 1234'], BS: ['+1', 10, 10, false, '242 359 1234'],
    DM: ['+1', 10, 10, false, '767 225 1234'], DO: ['+1', 10, 10, false, '809 555 0199'],
    GD: ['+1', 10, 10, false, '473 403 1234'], GU: ['+1', 10, 10, false, '671 300 1234'],
    JM: ['+1', 10, 10, false, '876 555 0199'], KN: ['+1', 10, 10, false, '869 662 1234'],
    KY: ['+1', 10, 10, false, '345 323 1234'], LC: ['+1', 10, 10, false, '758 284 1234'],
    MP: ['+1', 10, 10, false, '670 234 1234'], MS: ['+1', 10, 10, false, '664 492 1234'],
    PR: ['+1', 10, 10, false, '787 555 0199'], SX: ['+1', 10, 10, false, '721 520 1234'],
    TC: ['+1', 10, 10, false, '649 231 1234'], TT: ['+1', 10, 10, false, '868 620 1234'],
    UM: ['+1', 10, 10, false, '808 555 0199'], VC: ['+1', 10, 10, false, '784 430 1234'],
    VG: ['+1', 10, 10, false, '284 300 1234'], VI: ['+1', 10, 10, false, '340 642 1234'],

    // Francophone Africa, Europe & Maghreb (primary learner corridors)
    FR: ['+33', 9, 9, true, '6 38 42 19 75'],
    BE: ['+32', 8, 9, true, '470 58 29 14'],
    CH: ['+41', 9, 9, true, '79 482 51 67'],
    LU: ['+352', 6, 9, false, '628 491 735'],
    MC: ['+377', 8, 9, false, '6 48 21 93 74'],
    MA: ['+212', 9, 9, true, '6 52 84 19 37'],
    DZ: ['+213', 9, 9, true, '5 51 84 29 67'],
    TN: ['+216', 8, 8, false, '20 482 719'],
    CM: ['+237', 9, 9, false, '6 99 24 81 53'],
    CI: ['+225', 10, 10, false, '07 48 21 95 63'], // Ivorian 10-digit numbers preserve leading 0 in E.164
    SN: ['+221', 9, 9, false, '77 482 91 53'],
    CD: ['+243', 9, 9, true, '81 492 73 65'],
    CG: ['+242', 9, 9, false, '06 123 4567'],
    GA: ['+241', 7, 8, true, '77 12 34 56'],
    BJ: ['+229', 8, 10, false, '01 97 12 34 56'],
    TG: ['+228', 8, 8, false, '90 12 34 56'],
    BF: ['+226', 8, 8, false, '70 12 34 56'],
    ML: ['+223', 8, 8, false, '70 12 34 56'],
    NE: ['+227', 8, 8, false, '90 12 34 56'],
    GN: ['+224', 8, 9, false, '622 12 34 56'],
    TD: ['+235', 8, 8, false, '66 12 34 56'],
    CF: ['+236', 8, 8, false, '70 12 34 56'],
    BI: ['+257', 8, 8, false, '79 12 34 56'],
    RW: ['+250', 9, 9, true, '788 123 456'],
    MG: ['+261', 9, 9, true, '32 12 345 67'],
    MU: ['+230', 7, 8, false, '5251 2345'],
    KM: ['+269', 7, 7, false, '321 23 45'],
    DJ: ['+253', 8, 8, false, '77 12 34 56'],
    MR: ['+222', 8, 8, false, '22 12 34 56'],
    HT: ['+509', 8, 8, false, '34 12 3456'],
    RE: ['+262', 9, 9, true, '692 12 34 56'],
    YT: ['+262', 9, 9, true, '639 12 34 56'],
    GP: ['+590', 9, 9, true, '690 12 34 56'],
    BL: ['+590', 9, 9, true, '690 12 34 56'],
    MF: ['+590', 9, 9, true, '690 12 34 56'],
    MQ: ['+596', 9, 9, true, '696 12 34 56'],
    GF: ['+594', 9, 9, true, '694 12 34 56'],
    PF: ['+689', 8, 8, false, '87 12 34 56'],
    NC: ['+687', 6, 6, false, '75 12 34'],
    PM: ['+508', 6, 6, false, '55 12 34'],
    WF: ['+681', 6, 6, false, '50 12 34'],

    // Rest of Africa
    AO: ['+244', 9, 9, false, '923 481 756'], BW: ['+267', 8, 8, false, '71 482 956'],
    CV: ['+238', 7, 7, false, '991 48 25'], EG: ['+20', 9, 10, true, '10 2849 6173'],
    EH: ['+212', 9, 9, true, '6 52 84 19 37'], ER: ['+291', 7, 7, true, '7 482 951'],
    ET: ['+251', 9, 9, true, '91 482 7395'], GH: ['+233', 9, 9, true, '24 482 9173'],
    GM: ['+220', 7, 7, false, '301 4825'], GQ: ['+240', 9, 9, false, '222 481 953'],
    GW: ['+245', 7, 9, false, '955 481 739'], KE: ['+254', 9, 9, true, '722 849153'],
    LR: ['+231', 7, 9, true, '77 481 9253'], LS: ['+266', 8, 8, false, '5012 4895'],
    LY: ['+218', 9, 9, true, '91 482 7395'], MW: ['+265', 9, 9, true, '991 48 29 53'],
    MZ: ['+258', 8, 9, false, '82 481 7593'], NA: ['+264', 8, 9, true, '81 482 7593'],
    NG: ['+234', 10, 10, true, '802 481 9573'], SC: ['+248', 7, 7, false, '2 510 489'],
    SD: ['+249', 9, 9, true, '91 482 7593'], SH: ['+290', 4, 5, false, '51234'],
    SL: ['+232', 8, 8, true, '25 481953'], SO: ['+252', 8, 9, false, '61 482 7593'],
    SS: ['+211', 9, 9, true, '977 482 915'], ST: ['+239', 7, 7, false, '981 4925'],
    SZ: ['+268', 8, 8, false, '7612 4895'], TZ: ['+255', 9, 9, true, '621 482 957'],
    UG: ['+256', 9, 9, true, '772 849153'], ZA: ['+27', 9, 9, true, '71 482 9517'],
    ZM: ['+260', 9, 9, true, '95 548 2917'], ZW: ['+263', 9, 9, true, '71 482 9537'],

    // Europe
    AD: ['+376', 6, 9, false, '312 849'], AL: ['+355', 8, 9, true, '67 482 9153'],
    AT: ['+43', 7, 13, true, '664 482917'], AX: ['+358', 6, 12, true, '45 4829173'],
    BA: ['+387', 8, 9, true, '61 482 953'], BG: ['+359', 8, 9, true, '88 482 9173'],
    BY: ['+375', 9, 9, true, '29 491 19 84'], CY: ['+357', 8, 8, false, '96 482915'],
    CZ: ['+420', 9, 9, false, '601 482 953'], DE: ['+49', 7, 12, true, '151 48293617'],
    DK: ['+45', 8, 8, false, '32 48 91 56'], EE: ['+372', 7, 8, false, '5123 4895'],
    ES: ['+34', 9, 9, false, '618 42 95 37'], FI: ['+358', 6, 12, true, '41 5829473'],
    FO: ['+298', 6, 6, false, '214895'], GB: ['+44', 10, 10, true, '7400 482951'],
    GG: ['+44', 10, 10, true, '7781 482951'], GI: ['+350', 8, 8, false, '57482951'],
    GR: ['+30', 10, 10, false, '694 821 7395'], HR: ['+385', 8, 9, true, '91 482 7593'],
    HU: ['+36', 8, 9, true, '20 482 9173'], IE: ['+353', 8, 9, true, '85 482 9173'],
    IM: ['+44', 10, 10, true, '7924 482951'], IS: ['+354', 7, 9, false, '611 4895'],
    IT: ['+39', 8, 11, false, '328 491 7562'], JE: ['+44', 10, 10, true, '7797 482951'],
    LI: ['+423', 7, 9, false, '660 482 951'], LT: ['+370', 8, 8, true, '612 48951'],
    LV: ['+371', 8, 8, false, '21 482 957'], MD: ['+373', 8, 8, true, '621 48 951'],
    ME: ['+382', 8, 8, true, '67 622 901'], MK: ['+389', 8, 8, true, '72 481 953'],
    MT: ['+356', 8, 8, false, '7912 4895'], NL: ['+31', 9, 9, true, '6 48291735'],
    NO: ['+47', 8, 8, false, '406 48 915'], PL: ['+48', 9, 9, false, '518 492 736'],
    PT: ['+351', 9, 9, false, '918 472 639'], RO: ['+40', 9, 9, true, '712 489 531'],
    RS: ['+381', 8, 9, true, '60 4829173'], RU: ['+7', 10, 10, true, '916 482-73-95'],
    SE: ['+46', 7, 10, true, '70 482 91 53'], SI: ['+386', 8, 8, true, '31 482 951'],
    SJ: ['+47', 8, 8, false, '412 48 951'], SK: ['+421', 9, 9, true, '912 481 953'],
    SM: ['+378', 8, 10, false, '66 66 48 12'], TR: ['+90', 10, 10, true, '532 489 17 65'],
    UA: ['+380', 9, 9, true, '50 482 9173'], VA: ['+39', 8, 11, false, '328 491 7562'],
    XK: ['+383', 8, 9, true, '44 481 953'],

    // Latin America & Caribbean (non-NANP)
    AR: ['+54', 10, 11, true, '11 4829-7361'], AW: ['+297', 7, 7, false, '560 4829'],
    BO: ['+591', 8, 8, false, '71482953'], BQ: ['+599', 7, 7, false, '318 4829'],
    BR: ['+55', 10, 11, true, '11 94821-7395'], BZ: ['+501', 7, 7, false, '622 4891'],
    CL: ['+56', 9, 9, false, '9 6482 9173'], CO: ['+57', 10, 10, false, '321 4829173'],
    CR: ['+506', 8, 8, false, '8312 4895'], CU: ['+53', 8, 8, true, '5 4829173'],
    CW: ['+599', 7, 8, false, '9 518 4829'], EC: ['+593', 9, 9, true, '99 482 9173'],
    FK: ['+500', 5, 5, false, '51234'], GL: ['+299', 6, 6, false, '22 48 91'],
    GS: ['+500', 5, 5, false, '51234'], GT: ['+502', 8, 8, false, '5123 4895'],
    GY: ['+592', 7, 7, false, '609 4821'], HN: ['+504', 8, 8, false, '9123 4895'],
    MX: ['+52', 10, 10, false, '55 4821 7395'], NI: ['+505', 8, 8, false, '8123 4895'],
    PA: ['+507', 7, 8, false, '6123 4895'], PE: ['+51', 9, 9, false, '987 452 613'],
    PY: ['+595', 9, 9, true, '961 482953'], SR: ['+597', 6, 7, false, '741 4895'],
    SV: ['+503', 8, 8, false, '7012 4895'], UY: ['+598', 8, 8, true, '94 231 849'],
    VE: ['+58', 10, 10, true, '412-4819573'],

    // Middle East & Asia
    AE: ['+971', 9, 9, true, '50 482 9173'], AF: ['+93', 9, 9, true, '70 482 9173'],
    AM: ['+374', 8, 8, true, '77 481953'], AZ: ['+994', 9, 9, true, '50 482 91 73'],
    BD: ['+880', 10, 10, true, '1718 492635'], BH: ['+973', 8, 8, false, '3600 4895'],
    BN: ['+673', 7, 7, false, '712 4895'], BT: ['+975', 8, 8, false, '17 48 29 53'],
    CN: ['+86', 11, 11, false, '138 0013 8492'], GE: ['+995', 9, 9, true, '555 48 29 17'],
    HK: ['+852', 8, 8, false, '5123 4895'], ID: ['+62', 9, 12, true, '812 4829 637'],
    IL: ['+972', 9, 9, true, '50 482 9173'], IN: ['+91', 10, 10, true, '98101 48295'],
    IO: ['+246', 7, 7, false, '380 4895'], IQ: ['+964', 10, 10, true, '790 482 9173'],
    IR: ['+98', 10, 10, true, '912 483 7591'], JO: ['+962', 9, 9, true, '7 9048 2917'],
    JP: ['+81', 10, 10, true, '90 4821 7395'], KG: ['+996', 9, 9, true, '700 482 951'],
    KH: ['+855', 8, 9, true, '91 482 953'], KP: ['+850', 8, 10, true, '192 482 9173'],
    KR: ['+82', 9, 10, true, '10 4821 7395'], KW: ['+965', 8, 8, false, '500 48915'],
    KZ: ['+7', 10, 10, true, '771 482 9173'], LA: ['+856', 8, 10, true, '20 48 291 735'],
    LB: ['+961', 7, 8, true, '71 482 953'], LK: ['+94', 9, 9, true, '71 482 9173'],
    MM: ['+95', 8, 10, true, '9 482 9173'], MO: ['+853', 8, 8, false, '6612 4895'],
    MN: ['+976', 8, 8, false, '8812 4895'], MV: ['+960', 7, 7, false, '771 4895'],
    MY: ['+60', 9, 10, true, '12 482 7395'], NP: ['+977', 10, 10, true, '984 4829173'],
    OM: ['+968', 8, 8, false, '9212 4895'], PH: ['+63', 10, 10, true, '905 482 9173'],
    PK: ['+92', 10, 10, true, '301 4829173'], PS: ['+970', 9, 9, true, '599 482 917'],
    QA: ['+974', 8, 8, false, '3312 4895'], SA: ['+966', 9, 9, true, '50 482 9173'],
    SG: ['+65', 8, 8, false, '8123 4895'], SY: ['+963', 9, 9, true, '944 567 890'],
    TH: ['+66', 9, 9, true, '81 482 9173'], TJ: ['+992', 9, 9, true, '917 48 29 17'],
    TL: ['+670', 7, 8, false, '7721 4895'], TM: ['+993', 8, 8, true, '66 481953'],
    TW: ['+886', 9, 9, true, '918 472 639'], UZ: ['+998', 9, 9, true, '91 482 73 95'],
    VN: ['+84', 9, 10, true, '91 482 73 95'], YE: ['+967', 9, 9, true, '714 829 635'],

    // Oceania & Territories
    AU: ['+61', 9, 9, true, '418 742 963'], CC: ['+61', 9, 9, true, '418 742 963'],
    CK: ['+682', 5, 5, false, '71 489'], CX: ['+61', 9, 9, true, '418 742 963'],
    FJ: ['+679', 7, 7, false, '701 4895'], FM: ['+691', 7, 7, false, '350 4895'],
    KI: ['+686', 5, 8, false, '72004895'], MH: ['+692', 7, 7, false, '235 4895'],
    NF: ['+672', 6, 6, false, '381495'], NR: ['+674', 7, 7, false, '555 4895'],
    NU: ['+683', 4, 7, false, '8884012'], NZ: ['+64', 8, 10, true, '21 482 9173'],
    PG: ['+675', 7, 8, false, '7012 4895'], PN: ['+64', 8, 10, true, '21 482 9173'],
    PW: ['+680', 7, 7, false, '620 1234'], SB: ['+677', 5, 7, false, '7421234'],
    TK: ['+690', 4, 6, false, '7290'], TO: ['+676', 5, 7, false, '771 5123'],
    TV: ['+688', 5, 7, false, '901234'], VU: ['+678', 5, 7, false, '591 2345'],
    WS: ['+685', 5, 7, false, '721 2345'],
};

const COUNTRY_PHONE = Object.fromEntries(
    Object.entries(RAW).map(([k, [dial, min, max, trunkZero, ex]]) => [k, { dial, min, max, trunkZero, ex }]),
);

const FRENCH_LEVEL_LIST = ['beginner', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FRENCH_LEVEL_CANON = new Map(FRENCH_LEVEL_LIST.map(v => [v.toLowerCase(), v]));
const BAD_RUN_RE = /^(.)\1+$/;
const BAD_SEQ_RE = /(?:01234567|12345678|23456789|98765432|87654321|76543210)/;

function cleanFrenchLevel(v) {
    const k = String(v ?? '').trim().toLowerCase();
    return FRENCH_LEVEL_CANON.get(k) || null;
}

function phoneRule(countryCode) {
    const code = String(countryCode || '').trim().toUpperCase();
    return COUNTRY_PHONE[code] || null;
}

/**
 * Normalizes and validates a WhatsApp phone number against the user's selected
 * country calling code, returning canonical E.164 (`+{cc}{national}`).
 */
function validateWhatsApp(rawInput, countryCode) {
    const code = String(countryCode || '').trim().toUpperCase();
    const rule = phoneRule(code) || { ...NANP, fallback: true };
    const dialDigits = rule.dial.slice(1);

    if (!code) {
        return { ok: false, problem: 'missing_country', dial: '', ex: '' };
    }
    const stripped = String(rawInput ?? '')
        .replace(/[\u200e\u200f\u202a-\u202e\s().-]+/g, '');
    if (!stripped) {
        return { ok: false, problem: 'missing', dial: rule.dial, ex: rule.ex };
    }
    if (!/^\+?\d+$/.test(stripped)) {
        return { ok: false, problem: 'invalid', dial: rule.dial, ex: rule.ex };
    }

    let national;
    if (stripped.startsWith('+') || stripped.startsWith('00')) {
        const intl = stripped.startsWith('+') ? stripped.slice(1) : stripped.slice(2);
        if (!intl || !intl.startsWith(dialDigits)) {
            return { ok: false, problem: 'country_mismatch', dial: rule.dial, ex: rule.ex };
        }
        national = intl.slice(dialDigits.length);
    } else {
        national = stripped;
        // NANP (+1) users sometimes enter 1 followed by the 10-digit number
        if (rule.dial === '+1' && national.length === 11 && national.startsWith('1')) {
            national = national.slice(1);
        }
    }

    if (rule.trunkZero && national.startsWith('0')) {
        national = national.slice(1);
    }

    if (national.length < rule.min || national.length > rule.max) {
        return { ok: false, problem: 'length', dial: rule.dial, ex: rule.ex };
    }
    if (rule.dial === '+1' && !/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) {
        return { ok: false, problem: 'invalid', dial: rule.dial, ex: rule.ex };
    }

    const e164Digits = `${dialDigits}${national}`;
    if (e164Digits.length < 7 || e164Digits.length > 15) {
        return { ok: false, problem: 'length', dial: rule.dial, ex: rule.ex };
    }
    if (BAD_RUN_RE.test(national) || BAD_SEQ_RE.test(national)) {
        return { ok: false, problem: 'invalid', dial: rule.dial, ex: rule.ex };
    }

    return { ok: true, e164: `+${e164Digits}`, dial: rule.dial, national, ex: rule.ex };
}

module.exports = {
    COUNTRY_PHONE,
    FRENCH_LEVELS: new Set(FRENCH_LEVEL_LIST),
    cleanFrenchLevel,
    phoneRule,
    validateWhatsApp,
};
