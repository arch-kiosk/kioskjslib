import { DateTime } from "luxon";
import * as KioskStandardLib from "./kioskstandardlib.ts"

export class KioskDateTimeError extends Error {
    constructor(message: string) {
    super(message); // (1)
    this.name = "KioskDateTimeError"; // (2)
  }
}

export class KioskDateTime {

    // check_kiosk_datetime(str_ts: DateTime, allow_date_only = false) {
    //
    // }

    latinMonths: { [key: string]: string } = {"I": "01", "II": "02", "III": "03", "IV": "04", "V": "05", "VI": "06",
        "VII": "07", "VIII": "08", "IX": "09", "X": "10", "XI": "11", "XII": "12"}

    arabicMonthToLatin = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

    /**
     * Returns a formatted Latin date string based on the provided Luxon DateTime object.
     *
     * @param dt a Luxon DateTime object to extract the date from
     * @param withTime Optional. A boolean flag to include time in the output. Default is true.
     * @returns The formatted Latin date string, with or without time based on the 'withTime' flag
     */
    getLatinDate(dt: DateTime, withTime = true) {
        const latinMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const dtStr = `${dt.day} ${latinMonths[dt.month - 1]} ${dt.year}`;
        return withTime ? dtStr + " " + dt.toLocaleString(DateTime.TIME_WITH_SECONDS) : dtStr;
    }

    /**
     * Initializes a kiosk date-time field (a HTMLInput Element) based on the provided ID.
     * Retrieves the UTC date from the specified field, converts it to a Luxon DateTime object in UTC zone,
     * adjusts the time zone if necessary, and updates the field value with the formatted Latin date string.
     *
     * @param id The ID of the HTML input element representing the kiosk date-time field
     * @param asRecordingTime Optional. If true this takes the IANA timezone from a hidden "-tz" Input Element.
     *                        Otherwise the time zone is taken from the current kiosk_iana_time_zone cookie.
     */

    initKioskDateTimeTzField(id: string, asRecordingTime=false) {
        let field = document.getElementById(id) as HTMLInputElement
        if (field) {
            let isoUTCDate = field.dataset.utcDate
            if (isoUTCDate) {
                let dt = DateTime.fromISO(isoUTCDate, { zone: "UTC" })
                let ianaTz = (document.getElementById(id + "-tz") as HTMLInputElement).value
                let tz = "-"
                if (asRecordingTime) {
                    tz = ianaTz
                } else {
                    if (ianaTz != "-") {
                        tz = KioskStandardLib.getCookie("kiosk_iana_time_zone")
                    }
                }
                if (tz !== "-" && tz !== "UTC") dt = dt.setZone(tz)
                field.value = this.getLatinDate(dt)
            }
        }
    }

    /**
     * Initializes <span class="kiosk-tz-span"> elements by expecting a ISO date as the span's text and
     * transforming it into a local time according to either the user's time zone or the recording time zone
     *
     * @param dialog
     * @param asRecordingTime if True the time zone is taken from the span's data-recording-tz-index attribute.
     * @param latinFormat default is true: expresses the date in Kiosk's latin date format
     */
    initKioskDateTimeSpans(dialog: HTMLElement, asRecordingTime: Boolean=false, latinFormat = true) {
        const spans = dialog.querySelectorAll("span.kiosk-tz-span")
        for (const span of spans as NodeListOf<HTMLElement>) {
            let ISOUTCDate = (span as HTMLElement).innerText
            if (ISOUTCDate) {
                let dt = DateTime.fromISO(ISOUTCDate, { zone: "UTC" })
                let tz = "-"
                const displayRecordingTime = (asRecordingTime || (span.dataset.displayMode && span.dataset.displayMode.toLowerCase() === "recording"))
                const ianaTz = span.dataset.recordingIanaTz
                if (displayRecordingTime) {
                    if (ianaTz) {
                        tz = ianaTz
                    }
                } else {
                    if (ianaTz != "-") {
                        tz = KioskStandardLib.getCookie("kiosk_iana_time_zone")
                    }
                }
                if (tz !== "-" && tz !== "UTC") dt = dt.setZone(tz)
                const dateStr = latinFormat?this.getLatinDate(dt):dt.toLocaleString()
                const tzStr = tz==="-"?" (legacy)":` (${tz})`
                const timeStr = displayRecordingTime?tzStr:""
                span.innerText = dateStr + timeStr
            }
        }
    }

    /**
     * validates a HTMLInputField that is supposed to contain a date time in its value
     * @param elementId The id of the element
     * @param errorClass default is "kiosk-error-border". class name that signals an error for the field
     * @param focusOnError default is true: in case of an error the element gets the focus
     * @returns the result of guessDateTime: A ISO8601 string of the date/time in UTC time zone
     */
    validateDateTimeField(elementId: string, errorClass: string="kiosk-error-border", focusOnError: boolean=true): string {
        const dtElement: HTMLInputElement = document.getElementById(elementId) as HTMLInputElement
        let result = ""
        if (dtElement) {
            if (errorClass && dtElement.classList.contains(errorClass)) {
                dtElement.classList.remove(errorClass);
            }
            let dt = dtElement.value
            if (dt && dt.trim()) {
                const tz = KioskStandardLib.getCookie("kiosk_iana_time_zone")
                const kdt = new KioskDateTime()
                try {
                    result = kdt.guessDateTime(dt, false, tz)?.toISO({
                        includeOffset: false,
                        suppressMilliseconds: true
                    }) as string
                    if (!result) {
                        throw Error("date/time value not understood.")
                    }
                } catch (e) {
                    if (errorClass) {
                        dtElement.classList.add(errorClass);
                    }
                    if (e instanceof KioskDateTimeError) {
                        if (focusOnError) {
                            dtElement.focus()
                        }
                    }
                    throw e
                }
            } else {
                result = ''
            }
        } else {
            throw Error(`ui element ${elementId} does not exist.`)
        }
        return result
    }

    /**
     * Splits a given string containing date and time (optional) into separate date and time parts.
     *
     * @param dateTimeInput The string containing both date and time to be split.
     * @returns An array with the date part as the first element and the time part as the second element.
     *          If the input does not contain a time, the time part is undefined.
     */
    splitDateAndTime(dateTimeInput: string): [string, string|undefined] {
        let dtParts: string[] = dateTimeInput.split(" ");
        let datePart: string = "";
        let timePart: string = ""

        if (dtParts.length < 2 || dtParts.length == 3) {
            return [dateTimeInput.trim(), undefined]
        }

        let lastSpace = dateTimeInput.lastIndexOf(" ")
        datePart = dateTimeInput.slice(0,lastSpace)
        timePart = dateTimeInput.slice(lastSpace+1);

        if (timePart.length > 1) {
            timePart = timePart.trim();
        }
        if (datePart.length > 1) {
            datePart = datePart.trim();
        }

        return [datePart, timePart === ""?undefined:timePart]
    }

    interpolateYear(year: number, margin_1900: number = 3): number {
        if (year > 100) {
            return year;
        }
        const year2digits: number = new Date().getFullYear() - Math.floor(new Date().getFullYear() / 1000) * 1000;
        if (year > (year2digits + margin_1900)) {
            return year + 1900;
        } else {
            return year + 2000;
        }
    }

    /**
     * formats year, month and day to a ISO8601 string. Does not check if the result is a valid date.
     * @param year int or string
     * @param month int or string
     * @param day int or string
     */
    formatISO8601DateStr(year: number|string, month: number|string, day: number|string) {
        day = String(day).padStart(2,'0')
        month = String(month).padStart(2,'0')
        year = this.interpolateYear(parseInt(String(year) || ""), 3)
        return `${year}-${month}-${day}`;
    }

    guessLatinDate(latinDate: string): string {
        /**
         * Takes a string representing a date in a Latin format and converts it to a standard ISO date format (YYYY-MM-DD).
         *
         * note: Does not check if the latin date is a correct date! It could return something like 2023-XIII-01 or so!
         *
         * @param latinDate - either a latin date with its part being separated by "." or " " or no separator at all.
         * @returns The converted date in the ISO format (YYYY-MM-DD) or an empty string if the guess failed.
         */
        const latinDatesRegexes: RegExp[] = [
            /^(?<day>\d{1,2})\.(?<latinMonth>[IVX]{1,4})\.(?<year>\d{2,4})$/,
            /^(?<day>\d{1,2}) (?<latinMonth>[IVX]{1,4}) (?<year>\d{2,4})$/,
            /^(?<day>\d{1,2})(?<latinMonth>[IVX]{1,4})(?<year>\d{2,4})$/
        ];
        let result: string = "";
        let p: RegExpMatchArray | null = null;

        for (const latinDateRegex of latinDatesRegexes) {
            const rxLatinDate: RegExp = new RegExp(latinDateRegex);
            p = rxLatinDate.exec(latinDate);
            if (p) {
                break;
            }
        }

        if (p) {
            try {
                const latinMonth: string | undefined = p.groups?.latinMonth;
                if (p.groups && latinMonth && this.latinMonths.hasOwnProperty(latinMonth)) {
                    result = this.formatISO8601DateStr(p.groups.year, this.latinMonths[latinMonth], p.groups.day)
                }
            } catch (e) {
                // Handle exceptions if needed
            }
        }
        return result;
    }

    /**
     * guesses the date and time from a string.
     *
     * throws KioskDateTimeError in case of errors
     * can also throw other Errors
     * returns a Luxon DateTime object with UTC time zone
     */
    guessDateTime(dateTimeInput: string, allowDateOnly=false, timeZone="utc"): DateTime | undefined {
        const isDT = DateTime.fromISO(dateTimeInput, {zone: 'utc'})
        if (isDT.isValid) return isDT

        let [datePart, timePart]= this.splitDateAndTime(dateTimeInput)
        if (!timePart && !allowDateOnly) {
            throw new KioskDateTimeError(`${dateTimeInput} has no time.` )
        }

        let p: string = this.guessLatinDate(datePart);
        if (p) {
            datePart = p;
        }

        const rx_german_date = /^(?<day>\d{1,2})\.(?<month>\d{1,2})\.(?<year>\d{2,4})$/;
        let rxResult = rx_german_date.exec(datePart);
        if (rxResult && rxResult.groups) {
            try {
                datePart = this.formatISO8601DateStr(rxResult.groups.year, rxResult.groups.month, rxResult.groups.day)
            } catch (e) {
                // handle exception
            }
        }

        const rx_us_date: RegExp = /^(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{2,4})$/;
        rxResult = rx_us_date.exec(datePart);
        if (rxResult && rxResult.groups) {
            try {
                datePart = this.formatISO8601DateStr(rxResult.groups.year, rxResult.groups.month, rxResult.groups.day)
            } catch (e) {
                // handle exception
            }
        }

        let ts: DateTime | undefined
        if (datePart) {
            if (timePart) {
                ts = DateTime.fromISO(datePart + "T" + timePart, {zone: timeZone, setZone: true}).toUTC()
            } else {
                ts = DateTime.fromISO(datePart,{zone: timeZone, setZone: true}).toUTC()
            }
            if (!ts.isValid) throw new KioskDateTimeError(`${dateTimeInput} is not a valid date`)
        }
        return ts
    }
}

