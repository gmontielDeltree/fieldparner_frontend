import { LitElement, html, unsafeCSS, render, CSSResultGroup, css } from "lit";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import { property, state } from "lit/decorators.js";
import * as d3 from "d3";
//import './d3-scale-radial.js'

let puntos_cardinales = [
  "    N",
  "    NNE",
  "    NE",
  "    ENE",
  "    E",
  "    ESE",
  "    SE",
  "    SSE",
  "    S",
  "    SSW",
  "    SW",
  "    WSW",
  "    W",
  "    WNW",
  "    NW",
  "    NNW",
];

export class RosaVientosChart extends LitElement {
  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  @property()
  data: any;

  firstUpdated() {
    this.chart();
  }

  chart() {
    var svg = d3.select(this.shadowRoot.getElementById("chart")),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      margin = { top: 40, right: 40, bottom: 40, left: 40 },
      innerRadius = 20,
      chartWidth = width - margin.left - margin.right,
      chartHeight = height - margin.top - margin.bottom,
      outerRadius = Math.min(chartWidth, chartHeight) / 2,
      g = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var angle = d3.scaleLinear().range([0, 2 * Math.PI]);

    var radius = d3.scaleLinear().range([innerRadius, outerRadius]);

    var x = d3
      .scaleBand()
      .range([0, 2 * Math.PI])
      .align(0);

    var y = d3
      .scaleLinear() //you can try scaleRadial but it scales differently
      .range([innerRadius, outerRadius]);

    var z = d3
      .scaleOrdinal()
      .range([
        "#4242f4",
        "#42c5f4",
        "#42f4ce",
        "#42f456",
        "#adf442",
        "#f4e242",
        "#f4a142",
        "#f44242",
      ]);

    // DATA
    // let selectedData = `angle,0-1,1-2,2-3,3-4,4-4,4-5,5-6,6p
    // N,0.5,1.6,0.9,0.9,0.4,0.3,0.2,0.1
    // NNE,0.6,1.8,1.3,0.8,0.5,0.3,0.1,0.1
    // NE,0.5,1.5,1.6,1.2,1.2,0.6,0.1,0.1
    // ENE,0.4,1.6,0.9,1,0.5,0.2,0.1,0.1
    // E,0.4,1.6,1,0.8,0.4,0.1,0.1,0.1
    // ESE,0.3,1.2,0.6,0.4,0.2,0.1,0.1,0.05
    // SE,0.4,1.5,0.6,0.5,0.4,0.05,0.05,0.05
    // SSE,0.4,1.7,0.9,0.5,0.4,0.1,0.05,0.05
    // S,0.6,2.2,1.4,0.8,0.7,0.1,0.1,0.05
    // SSW,0.4,2,1.7,0.9,0.6,0.2,0.05,0.1
    // SW,0.5,2.3,1.9,1.3,0.7,0.3,0.2,0.1
    // WSW,0.6,2.4,2.2,1.1,0.8,0.4,0.2,0.1
    // W,0.6,2.3,1.8,1.2,0.9,0.9,0.4,0.9
    // WNW,0.5,2.6,1.7,1.2,1,0.9,0.7,2.2
    // NW,0.4,2.3,1.8,1.3,1,0.9,0.7,1.5
    // NNW,0.1,0.8,0.8,1,0.7,0.3,0.4,0.2`;

    let data = this.data;
    // Object.assign(
    //   d3.csvParse(selectedData, (d, i, columns) => {
    //     console.log("DIC",d,i,columns)
    //     let t = 0;
    //     for (let i = 1; i < columns.length; ++i) {
    //       const columnName = columns[i];
    //       t += +d[columnName];
    //     }

    //     d.total = t;

    //     return d;
    //   }),
    //   { unit: "km/h" }
    // );

    // console.log('data OG',data)

    // console.log('data prop',this.data)

    x.domain(
      data.map(function (d) {
        return d.angle;
      })
    );
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.total;
      }),
    ]);
    z.domain(data.columns.slice(1));
    // Extend the domain slightly to match the range of [0, 2π].
    angle.domain([
      0,
      d3.max(data, function (d, i) {
        return i + 1;
      }),
    ]);
    radius.domain([
      0,
      d3.max(data, function (d) {
        return d.y0 + d.y;
      }),
    ]);
    let angleOffset = -360.0 / data.length / 2.0;
    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(data.columns.slice(1))(data))
      .enter()
      .append("g")
      .attr("fill", function (d) {
        return z(d.key);
      })
      .selectAll("path")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(function (d) {
            return y(d[0]);
          })
          .outerRadius(function (d) {
            return y(d[1]);
          })
          .startAngle(function (d) {
            return x(d.data.angle);
          })
          .endAngle(function (d) {
            return x(d.data.angle) + x.bandwidth();
          })
          .padAngle(0.01)
          .padRadius(innerRadius)
      )
      .attr("transform", function () {
        return "rotate(" + angleOffset + ")";
      });

    var label = g
      .append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        return (
          "rotate(" +
          (((x(d.angle) + x.bandwidth() / 2) * 180) / Math.PI -
            (90 - angleOffset)) +
          ")translate(" +
          (outerRadius + 30) +
          ",0)"
        );
      });

    label
      .append("text")
      .attr("transform", function (d) {
        return (x(d.angle) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) <
          Math.PI
          ? "rotate(90)translate(0,16)"
          : "rotate(-90)translate(0,-9)";
      })
      .text(function (d) {
        return d.angle;
      })
      .style("font-size", 14);

    g.selectAll(".axis")
      .data(d3.range(angle.domain()[1]))
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", function (d) {
        return "rotate(" + (angle(d) * 180) / Math.PI + ")";
      })
      .call(
        d3
          .axisLeft()
          .scale(radius.copy().range([-innerRadius, -(outerRadius + 10)]))
      );

    var yAxis = g.append("g").attr("text-anchor", "middle");

    var yTick = yAxis
      .selectAll("g")
      .data(y.ticks(5).slice(1))
      .enter()
      .append("g");

    yTick
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4,4")
      .attr("r", y);

    yTick
      .append("text")
      .attr("y", function (d) {
        return -y(d);
      })
      .attr("dy", "-0.35em")
      .attr("x", function () {
        return -10;
      })
      .text(y.tickFormat(5, "s"))
      .style("font-size", 14);

    var legend = g
      .append("g")
      .selectAll("g")
      .data(data.columns.slice(1).reverse())
      .enter()
      .append("g")
      //            .attr("transform", function(d, i) { return "translate(-40," + (i - (data.columns.length - 1) / 2) * 20 + ")"; });
      .attr("transform", function (d, i) {
        return (
          "translate(" +
          (outerRadius + 15) +
          "," +
          (-outerRadius + 40 + (i - (data.columns.length - 1) / 2) * 20) +
          ")"
        );
      });

    legend.append("rect").attr("width", 18).attr("height", 18).attr("fill", z);

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(function (d) {
        return d;
      })
      .style("font-size", 10);
  } // Fin chart()

  render() {
    // https://stackoverflow.com/questions/8639383/how-do-i-center-an-svg-in-a-div
    return html`<div>
      <svg id="chart" class="mx-auto" style="display: block;" width="500" height="400"></svg>
    </div> `;
  }
}

customElements.define("rosa-de-vientos", RosaVientosChart);

declare global {
  interface HTMLElementTagNameMap {
    "rosa-de-vientos": RosaVientosChart;
  }
}
