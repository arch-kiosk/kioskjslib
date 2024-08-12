// noinspection DuplicatedCode
import { expect, test } from 'vitest'
import * as kioskdatetime from "../src/kioskdatetime"
import { DateTime } from "luxon"

test("test kioskdatetime getLatinDate", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    expect(kioskDateTime.getLatinDate(DateTime.fromISO("2024-08-01T05:00:00Z").setZone("UTC"), true)).toBe("1 VIII 2024 05:00:00")
});

test("test kioskdatetime guessDateTime", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    const testDT = DateTime.fromISO("2024-08-01T05:00:00", {zone: "utc", setZone: true})
    expect(kioskDateTime.guessDateTime("2024-08-01T05:00:00Z")).toStrictEqual(testDT)
    expect(kioskDateTime.guessDateTime("2024-08-01T07:00:00+02")).toStrictEqual(testDT)
});

test("test that kioskdatetime guessDateTime assumes UTC if no time zone is given", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    const testDT = DateTime.fromISO("2024-08-01T05:00:00", {zone: "utc", setZone: true})
    expect(kioskDateTime.guessDateTime("2024-08-01T05:00:00")).toStrictEqual(testDT)
});

test("test that kioskdatetime guessDateTime assumes UTC if no time zone is given", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    const testDT = DateTime.fromISO("2024-08-01T05:00:00", {zone: "utc", setZone: true})
    expect(kioskDateTime.guessDateTime("2024-08-01T05:00:00")).toStrictEqual(testDT)
});

test("test that kioskdatetime.splitDateAndTime", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    expect(kioskDateTime.splitDateAndTime("1.3.2024 13:25")).toStrictEqual(["1.3.2024","13:25"])
    expect(kioskDateTime.splitDateAndTime("1.3.2024")).toStrictEqual(["1.3.2024",undefined])
    expect(kioskDateTime.splitDateAndTime("1 III 2024")).toStrictEqual(["1 III 2024",undefined])
    expect(kioskDateTime.splitDateAndTime("1 III 2024 14:00")).toStrictEqual(["1 III 2024","14:00"])
    expect(kioskDateTime.splitDateAndTime("1.III.2024 14:00")).toStrictEqual(["1.III.2024","14:00"])
    expect(kioskDateTime.splitDateAndTime("01 III 2024 14:00")).toStrictEqual(["01 III 2024","14:00"])
});

test("test interpolateYear", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    const currentYear: number = new Date().getFullYear() - 2000;
    expect(kioskDateTime.interpolateYear(1900)).toBe(1900)
    expect(kioskDateTime.interpolateYear(0)).toBe(2000)
    expect(kioskDateTime.interpolateYear(currentYear)).toBe(currentYear + 2000)
    expect(kioskDateTime.interpolateYear(currentYear+1)).toBe(currentYear + 2000 + 1)
    expect(kioskDateTime.interpolateYear(currentYear+2)).toBe(currentYear + 2000 + 2)
    expect(kioskDateTime.interpolateYear(currentYear+3)).toBe(currentYear + 2000 + 3)
    expect(kioskDateTime.interpolateYear(currentYear+4)).toBe(currentYear + 1900 + 4)
    expect(kioskDateTime.interpolateYear(currentYear+4+2000)).toBe(currentYear + 2000 + 4)
});

test("test guessLatinDate", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    const okayTests = [
        ["01 I 2023", "2023-01-01"],
        ["01.I.2023", "2023-01-01"],
        ["01I2023", "2023-01-01"],
        ["01 III 2023", "2023-03-01"],
        ["1 I 2023", "2023-01-01"],
        ["1.I.2023", "2023-01-01"],
        ["1I2023", "2023-01-01"],
        ["31 XII 2023", "2023-12-31"],
        ["31.XII.2023", "2023-12-31"],
        ["31XII2023", "2023-12-31"],
        ["31 XII 23", "2023-12-31"],
        ["31.XII.23", "2023-12-31"],
        ["31XII23", "2023-12-31"],
        ["31 XII 73", "1973-12-31"],
        ["31.XII.73", "1973-12-31"],
        ["31XII73", "1973-12-31"],
        ["28I73", "1973-01-28"],
        ["28II73", "1973-02-28"],
        ["28III73", "1973-03-28"],
        ["28IV73", "1973-04-28"],
        ["28V73", "1973-05-28"],
        ["28VI73", "1973-06-28"],
        ["28VII73", "1973-07-28"],
        ["28VIII73", "1973-08-28"],
        ["28IX73", "1973-09-28"],
        ["28X73", "1973-10-28"],
        ["28XI73", "1973-11-28"],
        ["28XII73", "1973-12-28"],
    ]

    for (const test of okayTests) {
        expect(kioskDateTime.guessLatinDate(test[0])).toStrictEqual(test[1])
    }
});

test("test guessDateTime", () => {
    let kioskDateTime = new kioskdatetime.KioskDateTime()
    expect(kioskDateTime.guessDateTime("01.03.2023",true)).toStrictEqual(DateTime.fromISO("2023-03-01T00:00:00", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("01.III.2023",true)).toStrictEqual(DateTime.fromISO("2023-03-01T00:00:00", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("01 III 2023",true)).toStrictEqual(DateTime.fromISO("2023-03-01T00:00:00", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("01 III 2023 12:10:23",true)).toStrictEqual(DateTime.fromISO("2023-03-01T12:10:23", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("1 III 2023 12:10:23",true)).toStrictEqual(DateTime.fromISO("2023-03-01T12:10:23", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("1III2023 12:10:23",true)).toStrictEqual(DateTime.fromISO("2023-03-01T12:10:23", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("1III23 12:10:23",true)).toStrictEqual(DateTime.fromISO("2023-03-01T12:10:23", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("03/01/2023 12:10:23",true)).toStrictEqual(DateTime.fromISO("2023-03-01T12:10:23", {zone: "utc", setZone: true}))
    expect( () => kioskDateTime.guessDateTime("1XIII23 12:10:23",true)).toThrowError(/not a valid date/)
    expect(kioskDateTime.guessDateTime("08/10/2024 15:38:00",true,"Europe/Paris")).toStrictEqual(DateTime.fromISO("2024-08-10T13:38:00", {zone: "utc", setZone: true}))
    expect(kioskDateTime.guessDateTime("10VIII24 15:38:00",true,"Europe/Paris")).toStrictEqual(DateTime.fromISO("2024-08-10T13:38:00", {zone: "utc", setZone: true}))
});


