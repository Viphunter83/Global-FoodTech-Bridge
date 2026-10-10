package service

import "errors"

// ErrValidation marks errors caused by invalid client input; handlers return them as 400.
var ErrValidation = errors.New("validation error")

type validationError struct{ msg string }

func (e *validationError) Error() string { return e.msg }
func (e *validationError) Unwrap() error { return ErrValidation }

// ValidationError creates an error whose message is safe to show to the client.
func ValidationError(msg string) error { return &validationError{msg: msg} }
