export abstract class Mapper<From = any, To = any> {
	abstract map(value: From): To;
}
