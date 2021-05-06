using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HealthCare.Infrastructure.Migrations
{
    public partial class inherit_entity_class : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Hospitals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "Hospitals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Hospitals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "Hospitals",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "Doctors",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "Doctors",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Departments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "Departments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Departments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "Departments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(4667), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(4675) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5592), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5593) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5595), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5596) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5596), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5597) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5598), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5599) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5599), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5600) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5602), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5602) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5603), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5604) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5605), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5605) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5606), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5607) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5607), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5608) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5609), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5610) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5611), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5612) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5613), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5614) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5615), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5616) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5616), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5617) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5618), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5619) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5620), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5620) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5621), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5622) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5623), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5624) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5624), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5625) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5626), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5626) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5671), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5671) });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn" },
                values: new object[] { "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5672), "script", new DateTime(2021, 5, 6, 20, 16, 58, 77, DateTimeKind.Utc).AddTicks(5673) });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "AspNetUsers");
        }
    }
}
