using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace UniversitySystem.Authorization
{
    public class StudentOwnerOrAdminHandler
        : AuthorizationHandler<StudentOwnerOrAdminRequirement, int>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            StudentOwnerOrAdminRequirement requirement,
            int studentId)
        {
            // Admin has full access
            if (context.User.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Get StudentId from JWT
            var studentIdClaim = context.User.FindFirstValue("StudentId");

            if (int.TryParse(studentIdClaim, out int authenticatedStudentId) &&
                authenticatedStudentId == studentId)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}