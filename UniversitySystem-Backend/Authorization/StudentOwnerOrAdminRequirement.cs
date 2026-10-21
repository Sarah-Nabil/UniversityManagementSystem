using Microsoft.AspNetCore.Authorization;

namespace UniversitySystem.Authorization
{
    public class StudentOwnerOrAdminRequirement : IAuthorizationRequirement
    {
    }
}