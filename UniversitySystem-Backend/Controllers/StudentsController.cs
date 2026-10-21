using Application.DTOs.Student;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace UniversitySystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {

        private readonly IStudentService _studentService;
        private readonly IAuthorizationService _authorizationService;
        private readonly ILogger<StudentsController> _logger;
        public StudentsController(
     IStudentService studentService,
     IAuthorizationService authorizationService,
     ILogger<StudentsController> logger)
        {
            _studentService = studentService;
            _authorizationService = authorizationService;
            _logger = logger;
        }

        [Authorize(Roles = "Admin")]
        // GET: api/students
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _studentService.GetAllStudentsAsync();

            return Ok(students);
       

        }

        // GET: api/students/{id}

        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetStudentById(int id)
        //{
        //    var student = await _studentService.GetStudentByIdAsync(id);

        //    if (student == null)
        //    {
        //        return NotFound(new
        //        {
        //            message = "Student not found."
        //        });
        //    }

        //    var studentIdClaim = User.FindFirstValue("StudentId");

        //    if (!int.TryParse(studentIdClaim, out int authenticatedStudentId))
        //    {
        //        return Unauthorized();
        //    }

        //    bool isAdmin = User.IsInRole("Admin");

        //    if (!isAdmin && authenticatedStudentId != id)
        //    {
        //        return Forbid();
        //    }

        //    return Ok(student);
        //}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);

            if (student == null)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            var authResult = await _authorizationService.AuthorizeAsync(
                User,
                id,
                "StudentOwnerOrAdmin");

            if (!authResult.Succeeded)
            {
                return Forbid();
            }

            return Ok(student);
        }





        [Authorize(Roles = "Admin")]
        // POST: api/students
        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            var result = await _studentService.CreateStudentAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Failed to create student."
                });
            }

            return Ok(new
            {
                message = "Student created successfully."
            });



       
        }

        [Authorize(Roles = "Admin")]
        // PUT: api/students/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentDto dto)
        {
            var result = await _studentService.UpdateStudentAsync(id, dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Student not found."
                });
            }

            return Ok(new
            {
                message = "Student updated successfully."
            });
        }



        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            _logger.LogInformation(
                "Admin action started. AdminId={AdminId}, Action=DeleteStudent, TargetId={TargetId}, IP={IP}",
                adminId,
                id,
                ip);

            var result = await _studentService.DeleteStudentAsync(id);

            if (!result)
            {
                _logger.LogWarning(
                    "Admin action failed. AdminId={AdminId}, Action=DeleteStudent, TargetId={TargetId}, IP={IP}",
                    adminId,
                    id,
                    ip);

                return NotFound(new
                {
                    message = "Student not found."
                });
            }
            _logger.LogInformation(
                "Admin action succeeded. AdminId={AdminId}, Action=DeleteStudent, TargetId={TargetId}, IP={IP}",
                adminId,
                id,
                ip);
            return Ok(new
            {
                message = "Student deleted successfully."
            });
        }






















    }
}
