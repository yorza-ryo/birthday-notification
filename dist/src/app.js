"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const node_cron_1 = __importDefault(require("node-cron"));
const taskScheduler_1 = require("./queues/taskScheduler");
const error_handler_middleware_1 = require("./middlewares/error-handler.middleware");
const retryFailedTasks_1 = require("./queues/retryFailedTasks");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use("/users", user_route_1.default);
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, taskScheduler_1.schedulePendingTasks)();
    }
    catch (error) {
        console.error("Error in cron job:", error);
    }
}));
node_cron_1.default.schedule("*/2 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, retryFailedTasks_1.retryFailedTasks)();
    }
    catch (error) {
        console.error("Error in cron job:", error);
    }
}));
app.use(error_handler_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
