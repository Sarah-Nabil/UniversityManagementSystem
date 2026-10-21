using Application.DTOs.Auth;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
namespace UniversitySystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILoginService _loginService;
        private readonly ILogger<AuthController> _logger;
        public AuthController( ILoginService loginService,  ILogger<AuthController> logger)
        {
            _loginService = loginService;
            _logger = logger;
        }

        [HttpPost("Login")]
        [EnableRateLimiting("AuthLimiter")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _loginService.LoginAsync(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }
            _logger.LogInformation( "Login request completed. UserId={UserId}, IP={IP}", result.UserID,ip);
            return Ok(result);
        }


        [HttpPost("Refresh")]
        [EnableRateLimiting("AuthLimiter")]
        public async Task<IActionResult> Refresh(RefreshTokenRequestDto dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var result = await _loginService.RefreshAsync(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid or expired refresh token."
                });
            }
            _logger.LogInformation(
    "Refresh request completed. UserId={UserId}, IP={IP}",
    result.UserID,
    ip);
            return Ok(result);
        }



        [HttpPost("Logout")]
        public async Task<IActionResult> Logout(LogoutRequestDto dto)
        {
            var result = await _loginService.LogoutAsync(dto);

            if (!result)
            {
                return Unauthorized(new
                {
                    message = "Logout failed."
                });
            }

            return Ok(new
            {
                message = "Logged out successfully."
            });
        }





        [Authorize]
        [HttpPut("ChangePassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out int authenticatedUserId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            if (authenticatedUserId != dto.UserId)
            {
                return StatusCode(403, new { message = "User ID does not match." });
            }

            var result = await _loginService.ChangePasswordAsync(dto);

            if (result != null)
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            return Ok(new { message = "Password changed successfully." });
        }


        //[Authorize]
        //[HttpPut("ChangePassword")]
        //public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        //{
        //    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //    if (!int.TryParse(userIdClaim, out int authenticatedUserId))
        //    {
        //        return Unauthorized();
        //    }

        //    if (authenticatedUserId != dto.UserId)
        //    {
        //        return StatusCode(StatusCodes.Status403Forbidden);
        //    }

        //    var result = await _loginService.ChangePasswordAsync(dto);

        //    if (!result)
        //    {
        //        return BadRequest(new
        //        {
        //            message = "Password change failed."
        //        });
        //    }

        //    return Ok(new
        //    {
        //        message = "Password changed successfully."
        //    });
        //}
    }
}