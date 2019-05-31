
export class ParserState {
	public currentPath = "";
	public lastEndedNode = "";
	public isPathfound = false;
	public object: any = {};
	public paused = false;
	public isRootNode = true;
	public firstFoundNode = "";
	public interestedNodes: string[] = [];
}
