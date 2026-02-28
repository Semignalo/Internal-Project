"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDivisionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_division_dto_1 = require("./create-division.dto");
class UpdateDivisionDto extends (0, mapped_types_1.PartialType)(create_division_dto_1.CreateDivisionDto) {
}
exports.UpdateDivisionDto = UpdateDivisionDto;
//# sourceMappingURL=update-division.dto.js.map