import { ArbitraryObject, AttributeType, GroupType, LinkType, DatasetType } from './types';

type SpecificationType = {'core':ArbitraryObject} & ArbitraryObject
// API Generator
// Generates the NWB API from included specifications
export default class API {

  _specifications: SpecificationType
//   NWBFile?: ArbitraryObject;
  _debug: boolean;
  _namespaceToSchema: ArbitraryObject = {};
  extensions: ArbitraryObject = {};

  [x: string]: any;

  constructor(specifications: SpecificationType, debug=false) {
    this._debug = debug
    this._specifications = specifications

    this._generate('core', specifications)
    for (let key in specifications) {
      if (key !== 'core') {
        console.warn(`Loading ${key} extension.`)
        this._generate(key,specifications)
      }
    }
  }


  _inherit = (namespace: string, key:string, parentObject?:ArbitraryObject) => {
    const schema = this._namespaceToSchema[namespace][key]
    
    if (!parentObject) {
        schema.forEach((str:string) => {
            parentObject = this[str]
        })
    }

    if (parentObject){
      const o = parentObject[key]

      const inheritedName = o.inherits
      const inheritedSchema = this._namespaceToSchema[namespace][inheritedName]

      let inherit:ArbitraryObject | undefined;
      if (inheritedSchema){
        inherit = this
        inheritedSchema.forEach((str:string) => {
            inherit = inherit?.[str] 
        })
        inherit = inherit?.[inheritedName]
    }
      delete parentObject[key].inherits

      if (inherit) {
        if (inherit.inherits) this._inherit(namespace, inheritedName) // Finish inheritance for parent first
        const deep = JSON.parse(JSON.stringify(inherit))
      
        parentObject[key] = Object.assign(deep, o)
      } else if (o.inherits) console.log(`Cannot inherit ${inheritedName}`, o, namespace, schema, key)

      // Drill Into Objects
      if (typeof parentObject[key] === 'object')for (let k in parentObject[key]) this._inherit(namespace, k, parentObject[key])
    }
  }

  _getClasses(schema:ArbitraryObject){
    for (let clsName in schema) {
      // Construct Class
      const keys = Object.keys(schema[clsName])
      schema[clsName] = new Function(
          // `return function ${clsName}(${args.join(',')}){console.log(${args.join(',')})}`
          `return function ${clsName}(o={}){for (let k in o) if (o[k]) this[k] = o[k] }`
      )();

      keys.forEach(k => {
        schema[clsName].prototype[k] = schema[clsName][k]
      })
    }

  }
  

  _setFromObject(o: any, aggregator: ArbitraryObject = {}) {

    const name = o.neurodata_type_def ?? o.name ?? o.default_name
    const inherit = o.neurodata_type_inc

    if (name) {
        const value = o.value ?? o.default_value ?? {}
        if (aggregator[name] instanceof Function) aggregator[name].prototype[name] = inherit
        else aggregator[name] = value
    }

    // Skip Checking Links
    if (inherit && aggregator[name]) {
      if (aggregator[name] instanceof Function) aggregator[name].prototype.inherits = inherit
      else aggregator[name].inherits = inherit
    }


    // Attributes
    if (o.attributes) {
      o.attributes.forEach((attr: AttributeType) => {
        this._setFromObject(attr, aggregator[name] ?? aggregator)
      })
    }

    // Groups
    if (o.groups) {
      o.groups.forEach((group: GroupType) => {
        // console.log('Group', group)
        this._setFromObject(group, aggregator[name] ?? aggregator)
        // aggregator[name][attr.name] = attr.value ?? attr.default_value
      })

    }

    // Links
    if (o.links) {
      o.links.forEach((link: LinkType) => {
        // console.log('Link', link)
        this._setFromObject(link, aggregator[name] ?? aggregator)

        // aggregator[name][attr.name] = attr.value ?? attr.default_value
      })
    }

    // Datasets
    if (o.datasets) {
      o.datasets.forEach((dataset: DatasetType) => {
        // console.log('Dataset', dataset)
        this._setFromObject(dataset, aggregator[name] ?? aggregator)
      })
    }
  }

  _generate(key:string, specs: any = this._specifications) {

    const o = specs[key]
    const tick = performance.now()
    const version = Object.keys(o)[0]

    const namespaceInfo = o[version]?.namespace?.value
    const schemas:string[] = []
    if (namespaceInfo){
    const namespace = JSON.parse(namespaceInfo)
    namespace.namespaces.forEach((namespace: any) => {
      this._namespaceToSchema[namespace.name] = {} // Track all generated objects on a flat map
      namespace.schema.forEach((schema: any) => {

        // Grabbing Schema
        if (schema.source) {

          // Differentiate Non-Core Elements
          const extension = namespace.name !== 'core'
          if (extension && !this.extensions[namespace.name]) this.extensions[namespace.name] = {}

          // Set Schema Information
          const name = schema.source.replace('nwb.', '').replace('.extensions', '')
          const base = (extension) ? this.extensions[namespace.name] : this

          // Don't Overwrite Redundant Namespaces / Schemas
          if (!base[name]){
            base[name] = {}
            schemas.push(name)
            const info = JSON.parse(o[version][schema.source].value)

            this._setFromObject(info, base[name])

            // Register Objects
            for (let key in base[name]){
                this._namespaceToSchema[namespace.name][key] = (extension) ? ['extensions', namespace.name, name] : [name]
            }
            }
        }
      })

      // Ensure All Namespace Objects Inherit from Each Other
      for (let key in this._namespaceToSchema[namespace.name]) {
        this._inherit(namespace.name, key)
      }
    })

    schemas.forEach((name: string) => {
      this._getClasses(this[name])
    })

    const tock = performance.now()
    if (this._debug) console.log(`Generated ${key} API in ${tock - tick} ms`)
  } else console.warn('NWBJS API: Core unable to be generasted from file specifications.')
  }
}