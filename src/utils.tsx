
import * as d3 from 'd3';

export const formatNumber = (e:number) => d3.format(",")(e).replace(/,/g, " ")