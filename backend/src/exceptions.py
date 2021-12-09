class AuthError(Exception):
    code = 401
    description = 'Email or password is incorrect'


class DuplicateEmailError(Exception):
    code = 403
    description = "That email is already taken"


class SamePasswordError(Exception):
    code = 403
    description = "New password cannot be the same as old password"


class PasswordFormatException(Exception):
    code = 400
    description = "Password should have at least one number, at least one uppercase and one lowercase "
    "character, at least one special symbol, and be between 6 to 20 characters long."


class VerificationCodeError(Exception):
    code = 401
    description = "Could not verify email or phone number.\nCheck that your verification codes are correct"


class NotLoggedIn(Exception):
    code = 403
    description = "You are not logged in"


class UserNotFound(Exception):
    code = 403
    description = "User not found or doesn't exist"


class ExpiredToken(Exception):
    code = 403
    description = "Token is expired"

class BugReportSpamError(Exception):
    code = 400
    description = "You have sent 3 bug reports in the last hour. Please wait before sending another."
