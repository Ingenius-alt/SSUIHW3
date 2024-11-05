import { Err } from "./Err.js";
import { Check } from "./Check.js";
const evtTypeStrings = ['press', 'release', 'release_none', 'enter', 'exit',
    'move_inside', 'any', 'nevermatch'];
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
export class EventSpec {
    constructor(evtTyp, regionName) {
        this._evtType = evtTyp;
        this._regionName = regionName;
        this._region = undefined; // will be bound once full FSM is provided
    }
    // Construct an EventSpec from an EventSpec_json object, checking all the parts 
    // (since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we think/hope it is).
    static fromJson(evt) {
        const evtType = Check.limitedString(evt.evtType, evtTypeStrings, "nevermatch", "EventSpec.fromJson{evtType:}");
        const region = Check.stringVal(evt.region, "EvtType.fromJson{region:}");
        return new EventSpec(evtType, region);
    }
    get evtType() { return this._evtType; }
    get regionName() { return this._regionName; }
    get region() { return this._region; }
    //-------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------- 
    // Attempt to find the Region object corresponding to our named region within
    // the given list of regions, and assign that to this._region.  If the region
    // name is "*" or the region is not found, _region is set to undefined.
    bindRegion(regionList) {
        // look for the wildcard
        if (this._regionName === "*") {
            this._region = undefined;
            return;
        }
        // We go through the regionList and see if our regions' name
        // matches any in regionList. We then change our region
        // to that which we match to 
        for (let i = 0; i < regionList.length; i++) {
            if (regionList[i].name === this.regionName) {
                this._region = regionList[i];
                return;
            }
        }
        // we didn't match any region, that's ok for some forms that don't need a region
        if (this.evtType === 'nevermatch')
            return;
        if ((this.evtType === 'release_none' || this.evtType === 'any') &&
            this._regionName === "") {
            this._region = undefined;
            return;
        }
        Err.emit(`Region '${this._regionName}'` +
            ' in event specification does not match any region.');
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to perform a match against an actual event.  The event is represented 
    // by an event type (evtType) and an optional associated region (regn).  If 
    // our region is undefined and region name is "*", we will match to any region.
    match(evtType, regn) {
        // We check if we match our event and region to that of the 
        // event and region we are given. If our region is undefined or
        // * we return true. We also check if we have a release_none
        // event since we do not care for the region we have
        if (this.regionName === "*" && this.region === undefined) {
            return true;
        }
        if (this.evtType === 'release_none') {
            return evtType === this.evtType;
        }
        return evtType === this.evtType && regn === this.region;
    }
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------
    // Create a short human readable string representing this object for debugging
    debugTag() {
        return `EventSpec(${this.evtType} ${this.regionName})`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a human readable string displaying this object for debugging purposes
    debugString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaces per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        result += `${this.evtType} ${this.regionName}`;
        if (!this.region)
            result += " unbound";
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Log a human readable display of this object to the console
    dump() {
        console.log(this.debugString());
    }
} // end class EventSpec 
//===================================================================
//# sourceMappingURL=EventSpec.js.map