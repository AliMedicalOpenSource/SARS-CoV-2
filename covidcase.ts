declare module namespace {

    class CovidCass{ 
        onsetDate:string;
       gender:string;
       ageGroup:string;
       province:string;
       provinceCode:string;
       country:string;
       countryCode:string;
       region:string;
       regionCode:string;
       hospitalized:string;
       deceased:string;
       acquisition:string;
       
   constructor(reportDate :string,  onsetDate:string, gender:string,  ageGroup:string,
   province:string,
   provinceCode:string,
   country:string,
   countryCode:string,
   region:string,
   regionCode:string,
   hospitalized:string,
   deceased:string,
   acquisition:string) {
       this.onsetDate=onsetDate;
       this.gender=gender;
       this.ageGroup=ageGroup;
       this.province=province;
       this.provinceCode=provinceCode;
       this.country=country;
       this.countryCode=countryCode;
       this.region=region;
       this.regionCode=regionCode;
       this.hospitalized=hospitalized
       this.deceased=deceased;
       this.acquisition=acquisition;
     }
   }  
    export interface RootObject {
        CovidCase: CovidCase;
    }

}

