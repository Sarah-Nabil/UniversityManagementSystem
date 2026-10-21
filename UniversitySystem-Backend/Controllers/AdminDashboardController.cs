
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
 
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _service;

        public AdminDashboardController(IAdminDashboardService service)
        {
            _service = service;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var statistics = new
            {
                TotalStudents = await _service.GetTotalStudentsAsync(),
                TotalTeachers = await _service.GetTotalTeachersAsync(),
                TotalCourses = await _service.GetTotalCoursesAsync(),
                TotalEnrollments = await _service.GetTotalEnrollmentsAsync()
            };

            return Ok(statistics);

        }





        [HttpGet("recent-enrollments")]
        public async Task<IActionResult> GetRecentEnrollments()
        {
            var enrollments = await _service.GetRecentEnrollmentsAsync(5);

            return Ok(enrollments);
        }





    }
}
