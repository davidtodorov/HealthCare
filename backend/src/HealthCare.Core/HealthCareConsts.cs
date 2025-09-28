using HealthCare.Debugging;

namespace HealthCare;

public class HealthCareConsts
{
    public const string LocalizationSourceName = "HealthCare";

    public const string ConnectionStringName = "Default";

    public const bool MultiTenancyEnabled = false;


    /// <summary>
    /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
    /// </summary>
    public static readonly string DefaultPassPhrase =
        DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "8168ad00e9204cd7acd2f18362deda15";
}
