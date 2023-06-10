export interface DeepJsonDependency {
   name: string;
   version: string;
 }
 
 export interface DeepJson {
   dependencies: Array<DeepJsonDependency>;
   version: number;
 }