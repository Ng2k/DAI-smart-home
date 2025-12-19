/**
 * @brief Time unit of measure class file for the project
 * @file timeUom.class.ts
 * @author Nicola Guerra
 */
import { Uom } from "@/utils/enums";

/**
 * @brief Time unit of measure class
 * @class TimeUom
 */
export class TimeUom {
	private readonly _conversionMapping: Record<string, number> = {
		[Uom.MILLISECONDS]: 1,
		[Uom.SECONDS]: 1000,
		[Uom.MINUTES]: 60000,
	};

	/**
	 * @brief Convert a value from one unit of measure to another
	 * @param value The value to convert
	 * @param uom The unit of measure to convert from
	 * @returns The converted value
	 */
	public convert(value: number, uom: string): number {
		if (!this._conversionMapping[uom]) return value;
		return value * this._conversionMapping[uom];
	}
}
