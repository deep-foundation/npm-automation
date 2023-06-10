export interface DeepJsonDependency {
   /**
    * Name of the dependency
    */
   name: string;
   /**
    * Version of the dependency
    */
   version: string;
 }
 
 export interface DeepJson {
   /**
    * Dependencies of the package
    */
   dependencies: Array<DeepJsonDependency>;
   /**
    * Version of the package
    */
   version: number;
 }