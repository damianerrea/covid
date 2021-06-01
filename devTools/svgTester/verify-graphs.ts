#! /usr/bin/env node

import parseArgs from "minimist"
import * as utils from "./utils"
import * as fs from "fs-extra"

import * as path from "path"
import { ChartTypeName } from "../../grapher/core/GrapherConstants"
async function main(parsedArgs: parseArgs.ParsedArgs) {
    // perpare and check arguments
    const inDir = parsedArgs["i"] ?? "grapherData"
    const referenceDir = parsedArgs["r"] ?? "grapherSvgs"
    const outDir = parsedArgs["o"] ?? "differentGrapherSvgs"
    const numPartitions = parsedArgs["n"] ?? 1
    const partition = parsedArgs["p"] ?? 1
    const reverseDirectories = parsedArgs["l"] ?? false
    const verbose = parsedArgs["v"] ?? false
    // minimist turns a single number into a JS number so we do toString to normalize (TS types are misleading)
    const rawGrapherIds: string = (parsedArgs["g"] ?? "").toString()

    if (partition <= 0) throw "Partition must be >= 1"
    if (partition > numPartitions) throw "Partition must be <= numPartitions"
    if (numPartitions <= 0) throw "numPartitions must be >= 1"
    if (numPartitions > 1000) throw "numPartitions must be <= 1000"
    if (!fs.existsSync(inDir)) throw `Input directory does not exist ${inDir}`
    if (!fs.existsSync(referenceDir))
        throw `Reference directory does not exist ${inDir}`
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

    const {
        differences,
        directoriesToProcess,
    }: {
        differences: number[]
        directoriesToProcess: string[]
    } = await utils.verifySvgs(
        rawGrapherIds,
        inDir,
        reverseDirectories,
        numPartitions,
        partition,
        referenceDir,
        verbose,
        outDir
    )

    if (differences.length === 0) {
        utils.logIfVerbose(
            verbose,
            `There were no differences in all ${directoriesToProcess.length} graphs processed`
        )
        process.exitCode = 0
    } else {
        console.warn(
            `${
                differences.length
            } graphs had differences: ${differences.join()}`
        )
        for (const id of differences) {
            console.log("", id) // write to stdout one grapher id per file for easy piping to other processes
        }
        process.exitCode = differences.length
    }
}

const parsedArgs = parseArgs(process.argv.slice(2))
if (parsedArgs["h"]) {
    console.log(`verify-graphs.js - utility to check if grapher svg renderings have changed vs the reference export

Usage:
    verify-graphs.js (-i DIR) (-o DIR)

Options:
    -i DIR         Input directory containing the data. [default: grapherData]
    -r DIR         Input directory containing the results.csv file to check against [default: grapherSvgs]
    -o DIR         Output directory that will contain the svg files that were different [default: differentGrapherSvgs]
    -n PARTITIONS  Number of partitions - if specified then only 1/PARTITIONS of directories will be processed [default: 1]
    -p PARTITION   Partition to process [ 1 - PARTITIONS ]. Specifies the partition to process in this run. [default: 1]
    -g IDS         Manually specify ids to verify (use comma separated ids and ranges, all without spaces. E.g.: 2,4-8,10)
    -l             Reverse the order (start from last). Useful to test different generation order.
    -v             Verbose mode
    `)
} else {
    try {
        main(parsedArgs)
    } catch (error) {
        console.error("Encountered an error", error)
        process.exitCode = -1
    }
}