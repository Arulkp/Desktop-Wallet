import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-firsttime',
  templateUrl: './firsttime.component.html',
  styleUrls: ['./firsttime.component.css']
})
export class FirsttimeComponent implements OnInit {

  public displayRequest = 'none';
  public displayRequest1 = 'block'
  @Input () updateFirstInitialize : any

  constructor(
  	private route:ActivatedRoute,
  	private router:Router
  	) { }

  ngOnInit() {
  }

  requestForTheme() {

    if (this.displayRequest === 'none') {
      this.displayRequest = 'block';
      this.displayRequest1 = 'none';
    } else {
      this.displayRequest = 'none';
    }
  }

  finalCheck(){
  	setTimeout(() => {this.updateFirstInitialize()}, 0)
  	// localStorage.setItem('firsttimeinitialized','true');
  	// this.router.navigate(['wallets-manager']);
  }

}
