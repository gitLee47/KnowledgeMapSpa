import { Component, OnInit } from '@angular/core';
import {ChangeDetectionStrategy, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map-chart.component.html',
  styleUrls: ['./map-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapChartComponent implements OnInit, OnChanges {

  @ViewChild('chart')
  chartElement: ElementRef;

  private svgElement: HTMLElement;
  private chartProps: any;

  private jsonData: any;
  private countriesGroup: any;

  constructor(private homeService: HomeService) { }

  ngOnInit() {
    this.getJsonData();
  }

  ngOnChanges() {

  }

  getJsonData() {
    this.homeService.getGlobalData().subscribe(jsonData => {
      if(jsonData) {
        this.jsonData = jsonData;
        this.buildChart();
      }
    })
  }

  buildChart() {
    this.chartProps = {};
  
    var margin = { top: 30, right: 20, bottom: 30, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

    // Define map projection
    var projection = d3
    .geoEquirectangular()
    .center([0, 15]) // set centre to further North
    .scale(width/(2*Math.PI)) // scale to fit group width
    .translate([width/2,height/2]) // ensure centred in group
    ;

    var path = d3
    .geoPath()
    .projection(projection);

    var zoom = d3
    .zoom()
    .on("zoom", this.zoomed)

    var svg = d3.select(this.chartElement.nativeElement)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .call(zoom);

    this.countriesGroup = svg
    .append("g")
    .attr("id", "map");

    // add a background rectangle
    // this.countriesGroup
    // .append("rect")
    // .attr("x", 0)
    // .attr("y", 0)
    // .attr("width", width)
    // .attr("height", height);

    var countries = this.countriesGroup
    .selectAll("path")
    .data(this.jsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function(d, i) {
        return "country" + d.properties.iso_a3;
    })
    .attr("class", "country")
    // add a mouseover action to show name label for feature/country
    .on("mouseover", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
    })
    .on("mouseout", function(d, i) {
        d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
    })
    // add an onclick action to zoom into clicked country
    .on("click", function(d, i) {
        d3.selectAll(".country").classed("country-on", false);
        d3.select(this).classed("country-on", true);
        //boxZoom(path.bounds(d), path.centroid(d), 20);
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
}
