const bn128 = require("snarkjs").bn128;
const bigInt = require("snarkjs").bigInt;
const babyJub = require("./babyjub");
const createBlakeHash = require("blake-hash");

const GENPOINT_PREFIX = "PedersenGenerator";
const windowSize = 3;
const nWindowsPerSegment = 62;

exports.hash = pedersenHash;
exports.getBasePoint = getBasePoint;

function pedersenHash(bits) {
    const bitsPerSegment = windowSize*nWindowsPerSegment;
    const nSegments = Math.floor((bits.length - 1)/(windowSize*nWindowsPerSegment)) +1;

    let accP = [bigInt.zero,bigInt.one];

    for (let s=0; s<nSegments; s++) {
        let nWindows;
        if (s == nSegments-1) {
            nWindows = Math.floor(((bits.length - (nSegments - 1)*bitsPerSegment) - 1) / windowSize) +1;
        } else {
            nWindows = nWindowsPerSegment;
        }
        let escalar = bigInt.zero;
        let exp = bigInt.one;
        for (let w=0; w<nWindows; w++) {
            let o = s*bitsPerSegment + w*windowSize;
            let acc = bigInt.one;
            for (let b=0; ((b<windowSize-1)&&(o<bits.length)) ; b++) {
                if (bits[o]) {
                    acc = acc.add( bigInt.one.shl(b) );
                }
                o++;
            }
            if (o<bits.length) {
                if (bits[o]) {
                    acc = acc.neg();
                }
                o++;
            }
            escalar = escalar.add(acc.mul(exp));
            exp = exp.shl(windowSize+1);
        }

        if (escalar.lesser(bigInt.zero)) {
            escalar = babyJub.subOrder.add(escalar);
        }

        accP = babyJub.addPoint(accP, babyJub.mulPointEscalar(getBasePoint(s), escalar));
    }

    console.log("accP: ");
    console.log(accP[0].toString(10));
    console.log(accP[1].toString(10));

    // return babyJub.packPoint(accP);
    return accP[0].toString(10);
}

let bases = [];

function getBasePoint(pointIdx) {
    if (pointIdx<bases.length) return bases[pointIdx];
    /*let p= null;
    let tryIdx = 0;
    while (p==null) {
        const S = GENPOINT_PREFIX + "_" + padLeftZeros(pointIdx, 32) + "_" + padLeftZeros(tryIdx, 32);
        const h = createBlakeHash("blake256").update(S).digest();
        h[31] = h[31] & 0xBF;  // Set 255th bit to 0 (256th is the signal and 254th is the last possible bit to 1)
        p = babyJub.unpackPoint(h);
        tryIdx++;
    }

    const p8 = babyJub.mulPointEscalar(p, 8);

    if (!babyJub.inSubgroup(p8)) {
        throw new Error("Point not in curve");
    }

    bases[pointIdx] = p8;*/

    basePoints = [
        [
            bigInt("17434558536782967610340762605448133754549234172198748128207635616973179917758"),
            bigInt("13809929214859773185494095338070573446620668786591540427529120055108311408601"),
        ],
        [
            bigInt("20881191793028387546033104172192345421491262837680372142491907592652070161952"),
            bigInt("5075784556128217284685225562241792312450302661801014564715596050958001884858"),
        ],
        [
            bigInt("8520090440088786753637148399502745058630978778520003292078671435389456269403"),
            bigInt("19065955179398565181112355398967936758982488978618882004783674372269664446856"),
        ],
        [
            bigInt("8252178246422932554470545827089444002049004598962888144864423033128179910983"),
            bigInt("15651909989309155104946748757069215505870124528799433233405947236802744549198"),
        ],
        [
            bigInt("19613701345946521139252906631403624319214524383237318926155152603812484828018"),
            bigInt("21617320264895522741112711536582628848652483577841815747293999179732881991324"),
        ],
        [
            bigInt("6155843579522854755336642611280808148477209989679852488581779041749546316723"),
            bigInt("15124604226542856727295916283584414325323133979788055132476373290093561626104"),
        ],
        [
            bigInt("2255552864031882424600016198277712968759818455778666488135834801088901251869"),
            bigInt("20183282562651407227856572417097745017658254303953678131504564910170801603804"),
        ],
        [
            bigInt("6469785718442780390486680321473277194625672464989021922834954388533973416947"),
            bigInt("5600720436353295795527652424649353386087879374665126501551955649891196987168"),
        ],
    ];

    const p8 = basePoints[pointIdx];
    bases[pointIdx] = p8;
    return p8;
}

function padLeftZeros(idx, n) {
    let sidx = "" + idx;
    while (sidx.length<n) sidx = "0"+sidx;
    return sidx;
}

/*
Input a buffer
Returns an array of booleans. 0 is LSB of first byte and so on.
 */
function buffer2bits(buff) {
    const res = new Array(buff.length*8);
    for (let i=0; i<buff.length; i++) {
        const b = buff[i];
        res[i*8] = b & 0x01;
        res[i*8+1] = b & 0x02;
        res[i*8+2] = b & 0x04;
        res[i*8+3] = b & 0x08;
        res[i*8+4] = b & 0x10;
        res[i*8+5] = b & 0x20;
        res[i*8+6] = b & 0x40;
        res[i*8+7] = b & 0x80;
    }
    return res;
}




