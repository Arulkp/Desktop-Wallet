import {Component, OnInit} from '@angular/core';
import {MarketBroadcastService} from '../../services/market-broadcast.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private selectedExchange: Subscription;
  public traceExchange = 'eth';
  public displayRequest = 'none';

  constructor(private market: MarketBroadcastService) {
    this.selectedExchange = this.market.selectedExchange$.subscribe((data) => this.getExchange(data));
  }

  ngOnInit() {

  }

  getExchange(data) {
    if (data) {
      //console.log('exchnage', data);
      this.traceExchange = data;
    }
  }

  requestForTheme() {

    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
    } else {
      this.displayRequest = 'none';
    }
  }
}
