// Hint: This is a great place to declare your global variables
let femaleData;
let maleData;
let combinedData;
let svg;
const transitionDuration = 1500;
let xScale;
let xAxis;
let yScale
let yAxis;
const pixelOffset = 5;
const xLabel = 'Year';
const yLabel = 'Employment Rate';
const maleLegendLabel = 'Male Employment Rate';
const femaleLegendLabel = 'Female Employment Rate';

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', () => {
    // Hint: create or set your svg element inside this function

    // This will load your CSV files and store them into two arrays.
    Promise.all([d3.csv('data/females_data.csv'), d3.csv('data/males_data.csv')])
        .then((values) => {
            console.log('Loaded the females_data.csv and males_data.csv');
            femaleData = values[0];
            maleData = values[1];
            // Combined male_data and female_data
            combinedData = maleData.concat(femaleData);
            const countrySelect = document.getElementById("countrySelect");
            // const countries = Object.keys(femaleData[0]).slice(1);
            const countries = ['Canada', 'China', 'India', 'United Kingdom', 'United States'];

            for (let i = 0; i < countries.length; i++) {
                const option = document.createElement("option");
                option.value = countries[i];
                option.text = countries[i];
                countrySelect.add(option);
            }
            // Hint: This is a good spot for the data wrangling
            wrangleData(maleData)
            wrangleData(femaleData)

            init()

            drawLollipopChart();
        });

});

// Converted data type from string to numeric and Date type
const wrangleData = (data) => {
    for (let i = 0; i < data.length; i++) {
        let entryObject = data[i];
        for (let key of Object.keys(entryObject)) {
            if (key !== "Year") {
                if (typeof data[i][key] === 'string') {
                    // Converted the string value to a numeric value
                    data[i][key] = parseFloat(data[i][key]);
                }
            } else {
                if (typeof data[i][key] === 'string') {
                    // Converted the string value to a Date value
                    data[i][key] = new Date(data[i][key]);
                }
            }
        }
    }
}

const init = () => {
    const margin = {top: 50, right: 30, bottom: 40, left: 60}, width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Appended the svg object to the body of the page
    svg = d3.select("#myDataVis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Added X axis
    xScale = d3.scaleTime().range([0, width])
    xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%Y"));
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "xAxis")

    // Added Y axis
    yScale = d3.scaleLinear().range([height, 0])
    yAxis = d3.axisLeft().scale(yScale);
    svg.append("g")
        .attr("class", "yAxis")

    // Added Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 200) + "," + -40 + ")");

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#3D898A"); // Male color

    legend.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .style("font-size", "15px")
        .text(maleLegendLabel);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#EA3891"); // Female color

    legend.append("text")
        .attr("x", 25)
        .attr("y", 38)
        .style("font-size", "15px")
        .text(femaleLegendLabel);

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text(xLabel);

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "start")
        .attr("x", -(height + margin.top + margin.bottom) / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text(yLabel);
}

// Use this function to draw the lollipop chart.
const drawLollipopChart = () => {
    const selectedCountry = document.getElementById("countrySelect").value;
    const newMinYear = new Date(d3.min(combinedData, (d) => d["Year"]));
    const newMaxYear = new Date(d3.max(combinedData, (d) => d["Year"]));

    newMinYear.setFullYear(newMinYear.getFullYear() - 1);
    newMaxYear.setFullYear(newMaxYear.getFullYear() + 1);

    // Updated the scales and axes
    xScale.domain([newMinYear, newMaxYear]);
    svg.selectAll(".xAxis")
        .transition()
        .duration(transitionDuration)
        .call(xAxis);

    yScale.domain([0, d3.max(combinedData, (d) =>
        d[selectedCountry])]);

    svg.selectAll(".yAxis")
        .transition()
        .duration(transitionDuration)
        .call(yAxis);

    // Lines
    const maleLines = svg.selectAll(".maleLine")
        .data(maleData)

    maleLines
        .join(
            enter => enter.append("line")
                .attr("x1", (d) => xScale(d["Year"]) - pixelOffset)
                .attr("y1", (d) => yScale(d[selectedCountry]))
                .attr("x2", (d) => xScale(d["Year"]) - pixelOffset)
                .attr("y2", yScale(0))
                .attr("stroke", "#3D898A")
                .style('stroke-width', '1.5')
                .attr("class", "maleLine"),
            update => update.transition()
                .duration(transitionDuration)
                .attr("y1", (d) => yScale(d[selectedCountry]))
                .attr("y2", yScale(0)),
            exit => exit.remove()
        )


    const femaleLines = svg.selectAll(".femaleLines")
        .data(femaleData)

    femaleLines
        .join(
            enter => enter.append("line")
                .attr("x1", (d) =>
                    xScale(d["Year"]) + pixelOffset)
                .attr("y1", yScale(0))
                .attr("x2", (d) =>
                    xScale(d["Year"]) + pixelOffset)
                .attr("y2", (d) =>
                    yScale(d[selectedCountry]))
                .attr("stroke", "#EA3891")
                .style('stroke-width', '1')
                .attr("class", "femaleLines"),
            update => update.attr("y1", yScale(0)).transition()
                .duration(transitionDuration)
                .attr("y2", (d) => yScale(d[selectedCountry])),
            exit => exit.remove()
        )


    // Circles
    const maleCircles = svg.selectAll(".maleCircles")
        .data(maleData)

    maleCircles
        .join(
            enter => enter.append("circle")
                .attr("class", "maleCircles")
                .attr("cx", (d) => xScale(d["Year"]) - pixelOffset)
                .attr("cy", (d) => yScale(d[selectedCountry]))
                .attr("r", "4")
                .attr("stroke", "#3D898A")
                .attr("fill", "#3D898A"),
            update => update.transition()
                .duration(transitionDuration)
                .attr("cx", (d) => xScale(d["Year"]) - pixelOffset)
                .attr("cy", (d) => yScale(d[selectedCountry])),
            exit => exit.remove()
        )


    const femaleCircles = svg.selectAll(".femaleCircles")
        .data(femaleData)

    femaleCircles
        .join(
            enter => enter.append("circle")
                .attr("class", "femaleCircles")
                .attr("cx", (d) => xScale(d["Year"]) + pixelOffset)
                .attr("cy", (d) => yScale(d[selectedCountry]))
                .attr("r", "4")
                .style("fill", "#EA3891"),
            update => update.transition()
                .duration(transitionDuration)
                .attr("cy", (d) => yScale(d[selectedCountry])),
            exit => exit.remove())

    console.log('trace:drawLolliPopChart()');
}

