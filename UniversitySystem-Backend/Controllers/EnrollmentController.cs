using Application.DTOs.Enrollment;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UniversitySystem.Controllers
{
    [Authorize]

    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;

        public EnrollmentsController(IEnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }
        [HttpPost]

   
        public async Task<IActionResult> CreateEnrollment(CreateEnrollmentDto dto)
        {
            bool isAdmin = User.IsInRole("Admin");

            // Only non-admin users need StudentId validation
            if (!isAdmin)
            {
                var studentIdClaim = User.FindFirst("StudentId")?.Value;

                if (!int.TryParse(studentIdClaim, out int authenticatedStudentId))
                {
                    return Unauthorized();
                }

                if (authenticatedStudentId != dto.StudentId)
                {
                    return Forbid();
                }
            }

            var result = await _enrollmentService.CreateEnrollmentAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Student is already enrolled in this course."
                });
            }

            return Ok(new
            {
                message = "Enrollment created successfully."
            });
        }





        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetStudentCourses(int studentId)
        {
            var studentIdClaim = User.FindFirst("StudentId")?.Value;

            if (!int.TryParse(studentIdClaim, out int authenticatedStudentId))
            {
                return Unauthorized();
            }

            bool isAdmin = User.IsInRole("Admin");

            if (!isAdmin && authenticatedStudentId != studentId)
            {
                return Forbid();
            }

            var courses = await _enrollmentService.GetStudentCoursesAsync(studentId);

            return Ok(courses);
        }



        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllEnrollments()
        {
            var enrollments = await _enrollmentService.GetAllEnrollmentsAsync();

            return Ok(enrollments);
        }



        [Authorize(Roles = "Admin")]
        [HttpPut("{enrollmentId}")]
        public async Task<IActionResult> UpdateEnrollment(
    int enrollmentId,
    UpdateEnrollmentDto dto)
        {
            var result = await _enrollmentService
                .UpdateEnrollmentAsync(enrollmentId, dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Enrollment not found or no changes were made."
                });
            }

            return Ok(new
            {
                message = "Enrollment updated successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{enrollmentId}")]
        public async Task<IActionResult> DeleteEnrollment(int enrollmentId)
        {
            var result = await _enrollmentService
                .DeleteEnrollmentAsync(enrollmentId);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Enrollment not found."
                });
            }

            return Ok(new
            {
                message = "Enrollment deleted successfully."
            });
        }




    }
}