﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthCare.Infrastructure
{
    public interface IPrincipalProvider
    {
        string GetCurrentUserName();
    }
}
