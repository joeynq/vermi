import { Injectable } from "@vermi/core";
import { TseepConsumer } from "@vermi/events";

@Injectable("SINGLETON")
export class WsConsumer extends TseepConsumer {}
