using Application.DTOs.Course;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UniversitySystem.Controllers
{

    [Authorize]

    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CoursesController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _courseService.GetAllCoursesAsync();

            return Ok(courses);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourseById(int id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);

            if (course == null)
            {
                return NotFound(new
                {
                    message = "Course not found."
                });
            }

            return Ok(course);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
        {
            var result = await _courseService.CreateCourseAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Course already exists."
                });
            }

            return Ok(new
            {
                message = "Course created successfully."
            });
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(
            int id,
            UpdateCourseDto dto)
        {
            var result = await _courseService.UpdateCourseAsync(id, dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Course update failed."
                });
            }

            return Ok(new
            {
                message = "Course updated successfully."
            });
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var result = await _courseService.DeleteCourseAsync(id);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Course delete failed."
                });
            }

            return Ok(new
            {
                message = "Course deleted successfully."
            });
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("Count")]
        public async Task<IActionResult> GetCoursesCount()
        {
            var count = await _courseService.GetCoursesCountAsync();

            return Ok(count);
        }












    }
}