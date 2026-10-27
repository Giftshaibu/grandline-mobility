import { Availability } from "./availability";
import { paths } from "../lib/categories";
import type { Kind } from "../lib/directory";
export function MobilityDetail({kind}:{kind:Kind;slug:string}) {return <section className="wrap section"><h1 className="directory-title">{paths[kind].title} details</h1><Availability result={{state:"unavailable"}}/></section>;}
