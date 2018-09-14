import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  selectedTopic: string;
  constructor() { }

  ngOnInit() {
    this.selectedTopic = "Programming";
  }

  onTopicChange(topic: string) {
    this.selectedTopic = topic;
  }

}
