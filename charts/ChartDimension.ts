// A chart "dimension" represents a binding between a chart
// and a particular variable that it requests as data

import { observable } from "mobx"
import { extend } from "./Util"
import { Time } from "./TimeBounds"
import { OwidVariableDisplaySettings } from "./owidData/OwidVariable"
import { owidVariableId, columnSlug } from "./owidData/OwidTable"
import { ChartConfig } from "./ChartConfig"

export declare type dimensionProperty = "y" | "x" | "size" | "color"

export interface DimensionSpec {
    property: dimensionProperty
    variableId: owidVariableId
    targetYear?: Time
    display?: OwidVariableDisplaySettings
}

export class ChartDimension implements DimensionSpec {
    @observable property!: dimensionProperty
    @observable variableId!: owidVariableId
    @observable columnSlug!: columnSlug

    // check on: malaria-deaths-comparisons and computing-efficiency

    @observable display: OwidVariableDisplaySettings = {
        name: undefined,
        unit: undefined,
        shortUnit: undefined,
        isProjection: undefined,
        conversionFactor: undefined,
        numDecimalPlaces: undefined,
        tolerance: undefined
    }

    // XXX move this somewhere else, it's only used for scatter x override
    @observable targetYear?: Time = undefined

    // If enabled, dimension settings will be saved onto variable as defaults
    // for future charts
    @observable saveToVariable?: true = undefined

    private chart: ChartConfig

    constructor(spec: DimensionSpec, chart: ChartConfig) {
        this.chart = chart
        if (spec.display) extend(this.display, spec.display)

        this.targetYear = spec.targetYear
        this.variableId = spec.variableId
        this.property = spec.property
    }
}
