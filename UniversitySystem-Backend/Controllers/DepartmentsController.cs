using Application.DTOs.Department;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UniversitySystem.Controllers
{

    [Authorize]

    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            var result = await _departmentService.GetAllDepartmentsAsync();

            return Ok(result);
        }


        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateDepartment(CreateDepartmentDto dto)
        {
            var result = await _departmentService.CreateDepartmentAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Department already exists."
                });
            }

            return Ok(new
            {
                message = "Department created successfully."
            });
        }

        [Authorize(Roles = "Admin")]

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(
            int id,
            UpdateDepartmentDto dto)
        {
            var result = await _departmentService.UpdateDepartmentAsync(id, dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Department update failed."
                });
            }

            return Ok(new
            {
                message = "Department updated successfully."
            });
        }



        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            try
            {
                var result = await _departmentService.DeleteDepartmentAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Department not found."
                    });
                }

                return Ok(new
                {
                    message = "Department deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

    }
}