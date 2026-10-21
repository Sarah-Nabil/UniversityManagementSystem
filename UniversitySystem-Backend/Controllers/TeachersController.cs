using Application.DTOs.Teacher;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace UniversitySystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeachersController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        // GET: api/Teachers
        [HttpGet]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _teacherService.GetAllTeachersAsync();

            return Ok(teachers);
        }

        // GET: api/Teachers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeacherById(int id)
        {
            var teacher = await _teacherService.GetTeacherByIdAsync(id);

            if (teacher == null)
            {
                return NotFound(new
                {
                    message = "Teacher not found."
                });
            }

            return Ok(teacher);
        }

        [Authorize(Roles = "Admin")]
        // POST: api/Teachers
        [HttpPost]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDto dto)
        {
            var result = await _teacherService.CreateTeacherAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Failed to create teacher."
                });
            }

            return Ok(new
            {
                message = "Teacher created successfully."
            });
        }


        [Authorize(Roles = "Admin")]
        // PUT: api/Teachers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTeacher(int id, [FromBody] UpdateTeacherDto dto)
        {
            var result = await _teacherService.UpdateTeacherAsync(id, dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Teacher not found."
                });
            }

            return Ok(new
            {
                message = "Teacher updated successfully."
            });
        }


        [HttpGet("dropdown")]
        public async Task<IActionResult> GetTeachersDropdown()
        {
            var teachers = await _teacherService.GetTeachersForDropdownAsync();

            return Ok(teachers);
        }


        [Authorize(Roles = "Admin")]
        // DELETE: api/Teachers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            var result = await _teacherService.DeleteTeacherAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Teacher not found."
                });
            }

            return Ok(new
            {
                message = "Teacher deleted successfully."
            });
        }
    }
}