/**
 * @brief Controller class
 * @file controller.class.ts
 * @author Nicola Guerra
 */
import { Component } from "../component.class";
import type { ComponentType, UnitOfMeasurement } from "../enums";

/**
 * This class represents a controller component.
 * @class Controller
 * @extends Component
 */
export class Controller extends Component {
    constructor(name: string, type: ComponentType, uom: UnitOfMeasurement, topics: string[]) {
        super(name, type, uom, topics);
    }
}
