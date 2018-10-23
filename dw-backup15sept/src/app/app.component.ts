import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public check: any = false;
  title = 'app';
  constructor(
    private zone: NgZone
    ){
    this.updateFirstInitialize = this.updateFirstInitialize.bind(this)
  }
  options = {
    "timeOut":0,
    "pauseOnHover": false,
    "showProgressBar": false,
    "clickToClose": true,
    "maxStack": 4,
    "icons" : {
      alert : "<i class='fa fa-times'></i>",
      error : "<i class='fa fa-times'></i>",
      info : "<i class='fa fa-times'></i>",
      warn : "<i class='fa fa-times'></i>",
      success : "<i class='fa fa-times'></i>"
    }
  };

  ngOnInit(){
    this.check = localStorage.getItem('firsttimeinitialized');
  }

  updateFirstInitialize(){
    localStorage.setItem('firsttimeinitialized','true');
    this.zone.run(()=>{
      this.check = 'true'
    })
  }
}
