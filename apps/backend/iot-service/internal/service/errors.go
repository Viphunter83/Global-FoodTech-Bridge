package service

import "errors"

var (
	// ErrValidation marks errors caused by invalid client input; handlers return them as 400.
	ErrValidation = errors.New("validation error")
	// ErrUnavailable marks a dependency outage; the device should retry later (503).
	ErrUnavailable = errors.New("dependency unavailable")
)

type validationError struct{ msg string }

func (e *validationError) Error() string { return e.msg }
func (e *validationError) Unwrap() error { return ErrValidation }

// ValidationError creates an error whose message is safe to show to the client.
func ValidationError(msg string) error { return &validationError{msg: msg} }
