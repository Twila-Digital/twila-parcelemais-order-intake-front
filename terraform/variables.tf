variable "region" {
  type        = string
  description = "AWS region"
  nullable    = false
}

variable "github_personal_access_token_secret_path" {
  description = "Path to the GitHub personal access token in AWS Parameter Store"
  type        = string
  nullable    = false
}

variable "access_token" {
  type        = string
  description = <<-EOT
    The personal access token for a third-party source control system for the Amplify app.
    The personal access token is used to create a webhook and a read-only deploy key. The token is not stored.
    Make sure that the account where the token is created has access to the repository.
    EOT
  default     = null
  sensitive   = true
}

variable "description" {
  type        = string
  description = "The description for the Amplify app"
  default     = null
}

variable "repository" {
  type        = string
  description = "The repository for the Amplify app"
  default     = null
}

variable "environment_variables" {
  type        = map(string)
  description = "The environment variables for the Amplify app"
  default     = {}
}

variable "iam_service_role_enabled" {
  type        = bool
  description = "Flag to create the IAM service role for the Amplify app"
  default     = false
  nullable    = false
}

variable "platform" {
  type        = string
  description = "The platform or framework for the Amplify app"
  default     = "WEB"
}

variable "environments" {
  type = map(object({
    branch_name                   = optional(string)
    backend_enabled               = optional(bool, false)
    environment_name              = optional(string)
    deployment_artifacts          = optional(string)
    stack_name                    = optional(string)
    display_name                  = optional(string)
    description                   = optional(string)
    enable_auto_build             = optional(bool)
    enable_basic_auth             = optional(bool)
    enable_notification           = optional(bool)
    enable_performance_mode       = optional(bool)
    enable_pull_request_preview   = optional(bool)
    environment_variables         = optional(map(string))
    framework                     = optional(string)
    pull_request_environment_name = optional(string)
    stage                         = optional(string)
    ttl                           = optional(number)
    webhook_enabled               = optional(bool, false)
  }))
  description = "The configuration of the environments for the Amplify App"
  default     = {}
  nullable    = false
}

variable "custom_rules" {
  type = list(object({
    condition = optional(string)
    source    = string
    status    = optional(string)
    target    = string
  }))
  description = "The custom rules to apply to the Amplify App"
  default     = []
  nullable    = false
}
variable "domains" {
  type = map(object({
    enable_auto_sub_domain = optional(bool, false)
    wait_for_verification  = optional(bool, false)
    sub_domain = list(object({
      branch_name = string
      prefix      = string
    }))
  }))
  description = "Amplify custom domain configurations, keyed by domain name"
  default     = {}
  nullable    = false
}

variable "root_domain" {
  type        = string
  description = "Route53 zone in the network account"
  default     = "credicarro.com.br"
}

variable "network_account_role_arn" {
  type        = string
  description = "Role in the network account used to manage Route53 records"
  default     = null
}
