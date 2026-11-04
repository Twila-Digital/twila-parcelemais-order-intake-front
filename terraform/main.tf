provider "aws" {
  region = var.region
}

provider "aws" {
  alias  = "network"
  region = var.region

  assume_role {
    role_arn = var.network_account_role_arn
  }
}

terraform {
  backend "s3" {}
}

data "aws_ssm_parameter" "github_pat" {
  name            = var.github_personal_access_token_secret_path
  with_decryption = true
}

module "amplify_app" {
  source = "./modules/amplify"

  access_token                  = data.aws_ssm_parameter.github_pat.value
  description                   = var.description
  repository                    = var.repository
  environment_variables         = var.environment_variables
  iam_service_role_enabled      = var.iam_service_role_enabled
  platform                      = var.platform
  environments                  = var.environments
  custom_rules                  = var.custom_rules
  domains                       = var.domains

  context = module.this.context
}
module "amplify_custom_domain" {
  source   = "./modules/amplify-custom-domain"
  for_each = var.domains

  providers = { aws = aws.network }

  zone_name           = var.root_domain
  domain_name         = each.key
  sub_domain_prefixes = [for sub in each.value.sub_domain : sub.prefix]
  domain_association  = module.amplify_app.domain_associations[each.key]

  context = module.this.context
}
