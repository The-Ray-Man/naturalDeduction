use utoipa::OpenApi;
use utoipauto::utoipauto;

#[utoipauto(paths = "src")]
#[derive(OpenApi)]
#[openapi(
    tags(
        (name = "naturalDeduction", description = "FMFP goes easy"),
    ),
)]
pub struct ApiDocs;
