import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import {   Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class CommonServiceService {

	constructor(private http:HttpClient) { }

	dynamicTable=()=>{
		return this.http.get("http://www.localhost:3000/agenda");
	}

	deleteData=(dataId)=>{
		let httpParams = new HttpParams().set('id', dataId);
		return this.http.delete("http://www.localhost:3000/agenda",{params:httpParams});
	}
	updateData=(dataId)=>{
		let httpParams = new HttpParams().set('id', dataId);
		return this.http.put("http://www.localhost:3000/agenda",{params:httpParams});
	}

	viewData=(dataId)=>{
		let httpParams = new HttpParams().set('id', dataId);
		return this.http.get("http://www.localhost:3000/agenda", {params:httpParams});
	}
}
