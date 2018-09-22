import { Component, OnInit } from '@angular/core';
import {ChangeDetectionStrategy, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';

import * as d3 from 'd3';

import { HomeService } from '../home.service';
import { countryData, colors } from '../home.models';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapChartComponent implements OnInit, OnChanges {
  @Input() topic: string;

  @ViewChild('chart')
  chartElement: ElementRef;

  private svgElement: HTMLElement;
  private chartProps: any;

  private jsonData: any;
  private population : any;
  private countriesGroup: any;
  private path: any;
  private projection: any;
  private color: any;
  
  constructor(private homeService: HomeService) { }

  ngOnInit() {
    this.setupChart();
    this.getJsonData(this.topic);
  }

  ngOnChanges() {
    if(this.countriesGroup)
      this.getJsonData(this.topic);
  }

  getJsonData(topic: string) {
    if(!topic) {
      return [];
    }

    this.homeService.getTopicCount(topic).subscribe(populationData => {
      if(populationData) {
        this.population = populationData;
        this.jsonData = JSON.parse(countryData);
        this.buildChart();
      }
    })
  }

  setupChart() {
    

    var margin = { top: 30, right: 20, bottom: 30, left: 50 },
    width = 1000,
    height = 550;

    // Define map projection
    this.projection = d3
    .geoEquirectangular()
    .center([0, 15]) // set centre to further North
    .scale(width/(2*Math.PI)) // scale to fit group width
    .translate([width/2, height/2]); // ensure centred in group
    
    this.path = d3
    .geoPath()
    .projection(this.projection);

    var zoom = d3
    .zoom()
    .on("zoom", this.zoomed)

    var svg = d3.select(this.chartElement.nativeElement)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zoom);

    this.countriesGroup = svg
    .append("g")
    .attr("id", "map")
    .attr("class", "container");
  }

  buildChart() {

    var colorIndex = Math.floor(Math.random() * colors.length);
    this.color = d3.scaleThreshold<number, string>()
    .domain([
      10000,
      100000,
      500000,
      1000000,
      5000000,
      10000000,
      50000000,
      100000000,
      500000000,
      1500000000
    ])
    .range(colors[colorIndex]);
  
    d3.select("g")
    .selectAll("path")
    .remove();

    d3.selectAll('.countryLabel')
    .remove();

    const populationById = {};
    this.population.forEach(d => { populationById[d.id] = +d.population; });
    this.jsonData.features.forEach(d => { d.population = populationById[d.id] });

    var countries = this.countriesGroup
    .selectAll("path")
    .data(this.jsonData.features)
    .enter()
    .append("path")
    .attr("d", this.path)
    .style('fill', d => this.color(populationById[d.id]))
    .attr("id", function(d, i) {
      return "country" + d.id;
    })
    .attr("class", "country")
    // add a mouseover action to show name label for feature/country
    .on("mouseover", function(d, i) {
      d3.select("#countryLabel" + d.id).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      d3.select("#countryLabel" + d.id).style("display", "none");
    })
    // add an onclick action to zoom into clicked country
    .on("click", function(d, i) {
      d3.selectAll(".country").classed("country-on", false);
      d3.select(this).classed("country-on", true);
      //boxZoom(path.bounds(d), path.centroid(d), 20);
    });

    var self = this;
    var countryLabels = this.countriesGroup
    .selectAll("g")
    .data(this.jsonData.features)
    .enter()
    .append("g")
    .attr("class", "countryLabel")
    .attr("id", function(d) {
      return "countryLabel" + d.id;
    })
    .attr("transform", function(d) {
      return (
        "translate(" + self.path.centroid(d)[0] + "," + self.path.centroid(d)[1] + ")"
      );
    })
    // add mouseover functionality to the label
    .on("mouseover", function(d, i) {
      d3.select(this).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      d3.select(this).style("display", "none");
    })   
    // add an onlcick action to zoom into clicked country
    .on("click", function(d, i) {
      d3.selectAll(".country").classed("country-on", false);
      d3.select("#country" + d.id).classed("country-on", true);
      //boxZoom(path.bounds(d), path.centroid(d), 20);
    });

    countryLabels
    .append("text")
    .attr("class", "countryName")
    .style("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 0)
    .text(function(d) {
      return d.properties.name;
    })
    .call(this.getTextBox);

    // add a background rectangle the same size as the text
    countryLabels
    .insert("rect", "text")
    .attr("class", "countryLabelBg")
    .attr("transform", function(d) {
      return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    })
    .attr("width", function(d) {
      return d.bbox.width + 4;
    })
    .attr("height", function(d) {
      return d.bbox.height;
    });      
  }

  zoomed() {
    var t = d3
      .event
      .transform
    ;
    this.countriesGroup.attr(
      "transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
    );
  }

  getTextBox(selection) {
    selection.each(function(d) {
      d.bbox = this.getBBox();
    });
  }

  updateChart() {
    const populationById = {};
    this.population.forEach(d => { populationById[d.id] = +d.population; });
    this.jsonData.features.forEach(d => { d.population = populationById[d.id] });

    d3.select("g")
    .selectAll("path")
    .remove();

    var countries = this.countriesGroup
    .selectAll("path")
    .data(this.jsonData.features)
    .enter()
    .append("path")
    .attr("d", this.path)
    .style('fill', d => this.color(populationById[d.id]))
    .attr("id", function(d, i) {
      return "country" + d.id;
    })
    .attr("class", "country")
    // add a mouseover action to show name label for feature/country
    .on("mouseover", function(d, i) {
      d3.select("#countryLabel" + d.id).style("display", "block");
    })
    .on("mouseout", function(d, i) {
      d3.select("#countryLabel" + d.id).style("display", "none");
    })
    // add an onclick action to zoom into clicked country
    .on("click", function(d, i) {
      d3.selectAll(".country").classed("country-on", false);
      d3.select(this).classed("country-on", true);
      //boxZoom(path.bounds(d), path.centroid(d), 20);
    });
  }
}
