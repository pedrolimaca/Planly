import { addDays, format } from 'date-fns';
export type HolidayRegion = 'all' | 'national' | 'sjc' | 'taubate';
export interface Holiday { date: string; name: string; scope: string; source: string }
export const holidaySources = {
 national: 'https://agenciagov.ebc.com.br/noticias/202512/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026',
 sjc: 'https://diariodomunicipio.sjc.sp.gov.br/portal/edicoes/download/2535',
 taubate: 'https://ecrie.com.br/sistema/conteudos/arquivo/a_241_1_1_08122025144906.pdf',
};
// Gregorian computus. Local noon prevents date shifts across DST boundaries.
function easter(year: number) {
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return new Date(year,Math.floor(n/31)-1,n%31+1,12);
}
/** Recurring rules verified against official 2026 calendars; no optional closures. */
export function holidaysForYear(year: number, region: HolidayRegion = 'all'): Holiday[] {
 const result: Holiday[]=[];
 const add=(date:string,name:string,scope:string,source:string)=>result.push({date,name,scope,source});
 const fixed=(md:string,name:string,scope:string,source:string)=>add(`${year}-${md}`,name,scope,source);
 const national: [string,string][]=[['01-01','Confraternização Universal'],['04-21','Tiradentes'],['05-01','Dia do Trabalho'],['09-07','Independência do Brasil'],['10-12','Nossa Senhora Aparecida'],['11-02','Finados'],['11-15','Proclamação da República'],['11-20','Dia Nacional de Zumbi e da Consciência Negra'],['12-25','Natal']];
 for(const [date,name] of national)fixed(date,name,'Nacional',holidaySources.national);
 const sunday=easter(year);
 add(format(addDays(sunday,-2),'yyyy-MM-dd'),'Sexta-feira da Paixão','Calendário nacional',holidaySources.national);
 if(region!=='national') {
  fixed('07-09','Revolução Constitucionalista','Estado de São Paulo',holidaySources.taubate);
  add(format(addDays(sunday,60),'yyyy-MM-dd'),'Corpus Christi',region==='all'?'São José dos Campos e Taubaté':region==='sjc'?'São José dos Campos':'Taubaté',region==='sjc'?holidaySources.sjc:holidaySources.taubate);
 }
 if(region==='all'||region==='sjc') {
  fixed('03-19','Dia de São José','São José dos Campos',holidaySources.sjc);
  fixed('07-27','Aniversário de São José dos Campos','São José dos Campos',holidaySources.sjc);
 }
 if(region==='all'||region==='taubate') {
  fixed('02-05','Elevação de Taubaté à categoria de cidade','Taubaté',holidaySources.taubate);
  add(format(addDays(sunday,1),'yyyy-MM-dd'),'São Benedito','Taubaté',holidaySources.taubate);
  fixed('10-04','São Francisco das Chagas','Taubaté',holidaySources.taubate);
 }
 return result.sort((a,b)=>a.date.localeCompare(b.date));
}
