const ws = new WebSocket("ws://localhost:3000/test");

const sid = "";

ws.onmessage = (event) => {
	console.log("Received message", event.data);
};

ws.onopen = () => {
	console.log("Connected");
	ws.send(new TextEncoder().encode(JSON.stringify("Test message")));
};

// setInterval(() => {
// 	if (!sid) {
// 		return;
// 	}
// 	console.log("Sending message");
// 	ws.send(
// 		new TextEncoder().encode(
// 			JSON.stringify({
// 				sid,
// 				type: "some-message",
// 				channel: "/test",
// 				data: {
// 					foo: "bar",
// 					bar: 123,
// 				},
// 			}),
// 		),
// 	);
// }, 2000);
